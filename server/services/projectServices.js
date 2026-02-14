import ErrorHandler from "../middlewares/error.js";
import { Project } from "../models/project.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const getProjectByStudent = async (studentId) => {
  return await Project.findOne({ student: studentId }).sort({ createdAt: -1 });
};

// create project
export const createProject = async ({ studentId, title, description }) => {
  const project = await Project.create({
    student: studentId,
    title: title.trim(),
    description: description.trim(),
  });

  return project;
};
//get project by id
export const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("feedback.supervisorId", "name email");

  if (!project) {
    throw new ErrorHandler("project not found", 404);
  }
  return project;
};

export const addFilesToProject = async (projectId, files) => {
  if (!files || files.length === 0) {
    throw new ErrorHandler("No files provided", 400);
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  const uploadedFiles = await Promise.all(
    files.map(async (file) => {
      const result = await uploadToCloudinary(file, `projects/${projectId}`);

      return {
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileType: result.resource_type,
        originalName: file.originalname,
        uploadedAt: new Date(),
      };
    }),
  );

  project.files.push(...uploadedFiles);
  await project.save();

  return project;
};

export const getAllProjects = async () => {
  const projects = await Project.find()
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });

  return projects;
};
export const markComplete = async (projectId) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { status: "completed" },
    { new: true, runValidators: true },
  )
    .populate("student", "name email")
    .populate("supervisor", "name email");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }
  return project;
};

export const addFeedback = async ({
  projectId,
  supervisorId,
  message,
  title,
  type,
}) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  project.feedback.push({
    supervisorId,
    message,
    title,
    type,
  });

  await project.save();

  const latestFeedback = project.feedback[project.feedback.length - 1];

  return { project, latestFeedback };
};

export const getProjectBySupervisor = async (supervisorId) => {
  return await getAllProjects({ supervisor: supervisorId });
};

export const updateProject = async (id, updatedData) => {
  const project = await Project.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  })
    .populate("student", "name email")
    .populate("supervisor", "name email");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }
  return project;
};
