import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import User from "../models/user.js";
import * as projectServices from "../services/projectServices.js";
import * as notificationServices from "../services/notificationServices.js";
import * as requestServices from "../services/requestServices.js";
import * as fileServices from "../services/fileServices.js";
import * as userServices from "../services/userServices.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notification.js";
import { SupervisorRequest } from "../models/superwiserRequest.js";
import { sendEmail } from "../services/emailService.js";
import {
  generateRequestAcceptTemplate,
  generateRequestRejectTemplate,
} from "../utils/emailTemplates.js";

export const getTeacherDashboardStats = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  const totalPendingRequests = await SupervisorRequest.countDocuments({
    supervisor: teacherId,
    status: "pending",
  });

  const completedProjects = await Project.countDocuments({
    supervisor: teacherId,
    status: "completed",
  });

  const recentNotifications = await Notification.find({
    user: teacherId,
  })
    .sort({ createdAt: -1 }) // latest first
    .limit(3); // only 3 notifications

  const dashboardStats = {
    totalPendingRequests,
    completedProjects,
    recentNotifications,
  };

  res.status(200).json({
    success: true,
    message: "dashboard stats fetched for teacher successfully",
    data: { dashboardStats },
  });
});

export const getRequests = asyncHandler(async (req, res, next) => {
  const { supervisor } = req.query;
  const filters = {};
  if (supervisor) filters.supervisor = supervisor;

  const { requests, total } = await requestServices.getAllRequest(filters);

  const updatedRequests = await Promise.all(
    requests.map(async (reqObj) => {
      const requestObj = reqObj?.toObject ? reqObj.toObject() : reqObj;

      if (requestObj?.student?._id) {
        const latestProject = await Project.findOne({
          student: requestObj.student._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        return { ...requestObj, latestProject };
      }

      return requestObj;
    }),
  );

  res.status(200).json({
    success: true,
    message: "Request fetched successfully",
    data: {
      requests: updatedRequests,
      total,
    },
  });
});
export const acceptRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const supervisorId = req.user._id;

  const request = await requestServices.acceptRequest(requestId, supervisorId);

  if (!request) {
    return next(new ErrorHandler("Request not found", 404));
  }

  //  Student info already available
  const { _id: studentId, name, email } = request.student;

  //  Notification
  try {
    await notificationServices.notifyUser(
      studentId,
      `Your supervisor request has been accepted by ${req.user.name}`,
      "approval",
      "/student/status",
      "low",
    );
  } catch (err) {
    console.error("Notification failed:", err.message);
  }

  //  Email
  try {
    const message = generateRequestAcceptTemplate({
      studentName: name,
      supervisorName: req.user.name,
    });

    await sendEmail({
      to: email,
      subject: "FYP SYSTEM - ✅ Your Supervisor Request Has Been Accepted",
      message,
    });
  } catch (err) {
    console.error("Email failed:", err.message);
  }

  res.status(200).json({
    success: true,
    message: "Request accepted successfully",
    data: {
      requestId: request._id,
      status: request.status,
      student: {
        id: studentId,
        name,
      },
    },
  });
});

export const rejectRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const supervisorId = req.user._id;

  const request = await requestServices.rejectRequest(requestId, supervisorId);

  if (!request) {
    return next(new ErrorHandler("Request not found", 404));
  }

  const { _id: studentId, name, email } = request.student;

  //  Notification
  try {
    await notificationServices.notifyUser(
      studentId,
      `Your supervisor request has been rejected by ${req.user.name}`,
      "rejection",
      "/student/status",
      "high",
    );
  } catch (err) {
    console.error("Notification failed:", err.message);
  }

  //  Email
  try {
    const message = generateRequestRejectTemplate({
      studentName: name,
      supervisorName: req.user.name,
    });

    await sendEmail({
      to: email,
      subject: "FYP SYSTEM - ❌ Your Supervisor Request Has Been Rejected",
      message,
    });
  } catch (err) {
    console.error("Email failed:", err.message);
  }

  res.status(200).json({
    success: true,
    message: "Request rejected successfully",
    data: {
      requestId: request._id,
      status: request.status,
      student: {
        id: studentId,
        name,
      },
    },
  });
});

export const getAssignedStudents = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  const students = await User.find({ supervisor: teacherId })
    .populate({
      path: "project",
      select: "title status supervisor",
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      total: students.length,
      students,
    },
  });
});

export const markComplete = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;

  const project = await projectServices.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (!project.supervisor) {
    return next(new ErrorHandler("No supervisor assigned", 400));
  }

  if (project.status === "completed") {
    return next(new ErrorHandler("Project already completed", 400));
  }

  if (project.supervisor._id.toString() !== teacherId.toString()) {
    return next(new ErrorHandler("Not authorised to mark complete", 403));
  }

  const updateProject = await projectServices.markComplete(projectId);

  try {
    await notificationServices.notifyUser(
      project.student._id,
      `Your project has been marked completed by your supervisor ${req.user.name}`,
      "general",
      "/student/status",
      "low",
    );
  } catch (err) {
    console.error("Notification failed:", err.message);
  }

  res.status(200).json({
    success: true,
    data: { project: updateProject },
    message: "Project marked as completed",
  });
});

export const addFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const supervisorId = req.user._id;
  const { message, title, type } = req.body;

  const project = await projectServices.getProjectById(projectId);
  console.log("PROJECT SUPERVISOR:", project.supervisor.toString());
  console.log("LOGGED IN SUPERVISOR:", supervisorId.toString());

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (!project.supervisor) {
    return next(new ErrorHandler("No supervisor assigned", 400));
  }
  if (project.supervisor._id.toString() !== supervisorId.toString()) {
    return next(new ErrorHandler("Not authorised to give feedback", 403));
  }

  if (!message || !title) {
    return next(
      new ErrorHandler("Feedback title and message are required", 400),
    );
  }

  const { project: updatedProject, latestFeedback } =
    await projectServices.addFeedback({
      projectId,
      supervisorId,
      message,
      title,
      type,
    });

  try {
    await notificationServices.notifyUser(
      project.student._id,
      `New feedback from your supervisor ${req.user.name}`,
      "feedback",
      "/student/feedback",
      type === "negative" ? "high" : "low",
    );
  } catch (err) {
    console.error("Notification failed:", err.message);
  }

  res.status(200).json({
    success: true,
    data: { project: updatedProject, feedback: latestFeedback },
    message: "Feedback sent successfully",
  });
});

export const getFiles = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  const projects = await projectServices.getProjectBySupervisor(teacherId);

  const allFiles = projects.flatMap((project) =>
    project.files.map((file) => ({
      ...file.toObject(),
      projectId: project._id,
      projectTitle: project.title,
      studentName: project.student.name,
      studentEmail: project.student.email,
    })),
  );

  res.status(200).json({
    success: true,
    data: {
      files: allFiles,
    },
  });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const supervisorId = req.user._id;

  const project = await projectServices.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.supervisor.toString() !== supervisorId.toString()) {
    return next(new ErrorHandler("Not authorized to download this file", 403));
  }

  const file = project.files.id(fileId);

  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  //Stream download
  fileServices.streamDownload(file.fileUrl, res, file.originalName);
});
