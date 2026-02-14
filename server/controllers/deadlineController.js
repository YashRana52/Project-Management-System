import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { Deadline } from "../models/deadline.js";
import { Project } from "../models/project.js";
import * as projectServices from "../services/projectServices.js";

export const createDeadline = asyncHandler(async (req, res, next) => {
  const { name, dueDate } = req.body;
  const { id } = req.params;

  if (!name || !dueDate) {
    return next(new ErrorHandler("Name and due date are required", 400));
  }

  const project = await projectServices.getProjectById(id);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const parsedDate = new Date(dueDate);
  if (isNaN(parsedDate.getTime())) {
    return next(new ErrorHandler("Invalid due date", 400));
  }

  const deadline = await Deadline.create({
    name,
    dueDate: parsedDate,
    createdBy: req.user._id,
    project: project._id,
  });

  await deadline.populate([
    { path: "createdBy", select: "name email" },
    { path: "project", select: "title student" },
  ]);

  await Project.findByIdAndUpdate(
    project._id,
    { deadline: parsedDate },
    { new: true, runValidators: true },
  );

  res.status(201).json({
    success: true,
    message: "Deadline created successfully",
    data: { deadline },
  });
});
