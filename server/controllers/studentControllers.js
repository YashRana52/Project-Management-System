import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import User from "../models/user.js";
import * as projectServices from "../services/projectServices.js";
import * as notificationServices from "../services/notificationServices.js";
import * as requestServices from "../services/requestServices.js";
import * as fileServices from "../services/fileServices.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notification.js";

//get studnet project
export const getStudentsProject = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await projectServices.getProjectByStudent(studentId);

  if (!project) {
    return res.status(200).json({
      success: true,
      data: { project: null },
      message: "No Project found for this student",
    });
  }

  return res.status(200).json({
    success: true,
    data: { project },
  });
});

//submit proposal
export const submitProposal = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const studentId = req.user._id;

  if (!title || !description) {
    return next(new ErrorHandler("Title and description are required", 400));
  }

  const existingProject = await projectServices.getProjectByStudent(studentId);

  if (existingProject && existingProject.status !== "rejected") {
    return next(
      new ErrorHandler(
        "You already have an active project. You can submit a new proposal only if the previous project is rejected",
        400,
      ),
    );
  }

  if (existingProject && existingProject.status === "rejected") {
    await Project.findByIdAndDelete(existingProject._id);
  }

  const project = await projectServices.createProject({
    studentId,
    title,
    description,
  });

  await User.findByIdAndUpdate(studentId, {
    project: project._id,
  });

  res.status(201).json({
    success: true,
    message: "Project proposal submitted successfully",
    data: { project },
  });
});

//upload files
export const uploadFiles = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;

  const project = await projectServices.getProjectById(projectId);

  if (!project || project.student._id.toString() !== studentId.toString()) {
    return next(
      new ErrorHandler("Not authorized to upload files to this project", 403),
    );
  }
  if (!project.supervisor) {
    return next(
      new ErrorHandler(
        "You cannot upload files until a mentor is assigned",
        403,
      ),
    );
  }

  // Files validation
  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No files uploaded", 400));
  }

  const updatedProject = await projectServices.addFilesToProject(
    projectId,
    req.files,
  );

  res.status(200).json({
    success: true,
    message: "Files uploaded successfully",
    data: { project: updatedProject },
  });
});

export const getAvailableSuperVisors = asyncHandler(async (req, res, next) => {
  const supervisors = await User.find({ role: "Teacher" })
    .select("name email department experties")
    .lean();

  res.status(200).json({
    success: true,
    data: { supervisors },
    message: "supervisor data",
  });
});

export const getSupervisor = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const student = await User.findById(studentId).populate(
    "supervisor",
    "name email department experties",
  );

  if (!student) {
    return next(new ErrorHandler("Student not found", 404));
  }

  if (!student.supervisor) {
    return res.status(200).json({
      success: true,
      data: { supervisor: null },
      message: "No supervisor assigned yet",
    });
  }

  //  Supervisor assigned
  return res.status(200).json({
    success: true,
    data: { supervisor: student.supervisor },
  });
});

export const requestSupervisor = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const { teacherId, message } = req.body;

  const student = await User.findById(studentId);
  if (!student) {
    return next(new ErrorHandler("Student not found", 404));
  }

  if (student.supervisor) {
    return next(
      new ErrorHandler("You already have a supervisor assigned.", 400),
    );
  }

  const supervisor = await User.findById(teacherId);
  if (!supervisor || supervisor.role !== "Teacher") {
    return next(new ErrorHandler("Invalid supervisor selected.", 400));
  }

  if (supervisor.assignedStudents.length >= supervisor.maxStudents) {
    return next(
      new ErrorHandler(
        "Selected supervisor has reached maximum student capacity",
        400,
      ),
    );
  }

  const request = await requestServices.createRequest({
    student: studentId,
    supervisor: teacherId,
    message,
  });

  await notificationServices.notifyUser(
    teacherId,
    `${student.name} has requested ${supervisor.name} to be their supervisor`,
    "request",
    "/teacher/requests",
    "medium",
  );

  return res.status(201).json({
    success: true,
    message: "Supervisor request sent successfully",
    data: { request },
  });
});

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const now = new Date();

  // Latest project
  const project = await Project.findOne({ student: studentId })
    .sort({ createdAt: -1 })
    .populate("supervisor", "name")
    .lean();

  // Upcoming deadlines (nearest first)
  const upcomingDeadlines = await Project.find({
    student: studentId,
    deadline: { $gte: now },
  })
    .select("title description deadline supervisor")
    .sort({ deadline: 1 })
    .limit(3)
    .populate("supervisor", "name")
    .lean();

  // Latest notifications
  const topNotifications = await Notification.find({ user: studentId })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  // Latest 2 feedbacks
  const feedbackNotification =
    project?.feedback?.length > 0
      ? [...project.feedback]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2)
      : [];

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      project,
      upcomingDeadlines,
      topNotifications,
      feedbackNotification,
      supervisorName: project?.supervisor?.name || null,
    },
  });
});

export const getFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;

  const project = await projectServices.getProjectById(projectId);

  if (!project || project.student._id.toString() !== studentId.toString()) {
    return next(
      new ErrorHandler("Not authorized to view feedback for this project", 403),
    );
  }

  const sortedFeedback = project.feedback
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((f) => ({
      _id: f._id,
      title: f.title,
      message: f.message,
      type: f.type,
      createdAt: f.createdAt,
      supervisorName: f.supervisorId?.name,
      supervisorEmail: f.supervisorId?.email,
    }));

  res.status(200).json({
    success: true,
    data: { feedback: sortedFeedback },
  });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;

  const project = await projectServices.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.student.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Not authorized to download this file", 403));
  }

  const file = project.files.id(fileId);

  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  //Stream download
  fileServices.streamDownload(file.fileUrl, res, file.originalName);
});
