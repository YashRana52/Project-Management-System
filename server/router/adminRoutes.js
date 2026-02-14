import express from "express";

import { isAuthorized, protect } from "../middlewares/auth.js";
import {
  assignSupervisor,
  createStudent,
  createTeacher,
  deleteStudent,
  deleteTeacher,
  getAllProjects,
  getAllUsers,
  getDashboardData,
  getProject,
  updateProjectStatus,
  updateStudent,
  updateTeacher,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.post(
  "/create-student",
  protect,
  isAuthorized("Admin"),
  createStudent,
);
adminRouter.put(
  "/update-student/:id",
  protect,
  isAuthorized("Admin"),
  updateStudent,
);
adminRouter.delete(
  "/delete-student/:id",
  protect,
  isAuthorized("Admin"),
  deleteStudent,
);
adminRouter.post(
  "/create-teacher",
  protect,
  isAuthorized("Admin"),
  createTeacher,
);
adminRouter.put(
  "/update-teacher/:id",
  protect,
  isAuthorized("Admin"),
  updateTeacher,
);
adminRouter.delete(
  "/delete-teacher/:id",
  protect,
  isAuthorized("Admin"),
  deleteTeacher,
);
adminRouter.get("/projects", protect, isAuthorized("Admin"), getAllProjects);
adminRouter.get("/users", protect, isAuthorized("Admin"), getAllUsers);
adminRouter.post(
  "/assign-supervisor",
  protect,
  isAuthorized("Admin"),
  assignSupervisor,
);
adminRouter.get(
  "/fetch-dashboard-stats",
  protect,
  isAuthorized("Admin"),
  getDashboardData,
);
adminRouter.get("/project/:id", protect, isAuthorized("Admin"), getProject);
adminRouter.put(
  "/project/:id",
  protect,
  isAuthorized("Admin"),
  updateProjectStatus,
);

export default adminRouter;
