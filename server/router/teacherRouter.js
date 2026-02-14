import express, { request } from "express";

import { isAuthorized, protect } from "../middlewares/auth.js";

import {
  acceptRequest,
  addFeedback,
  getAssignedStudents,
  getFiles,
  getRequests,
  getTeacherDashboardStats,
  markComplete,
  rejectRequest,
} from "../controllers/teacherController.js";

const teacherRouter = express.Router();

teacherRouter.get(
  "/fetch-dashboard-stats",
  protect,
  isAuthorized("Teacher"),
  getTeacherDashboardStats,
);
teacherRouter.get("/requests", protect, isAuthorized("Teacher"), getRequests);
teacherRouter.put(
  "/requests/:requestId/accept",
  protect,
  isAuthorized("Teacher"),
  acceptRequest,
);
teacherRouter.put(
  "/requests/:requestId/reject",
  protect,
  isAuthorized("Teacher"),
  rejectRequest,
);
teacherRouter.post(
  "/feedback/:projectId",
  protect,
  isAuthorized("Teacher"),
  addFeedback,
);
teacherRouter.post(
  "/mark-complete/:projectId",
  protect,
  isAuthorized("Teacher"),
  markComplete,
);
teacherRouter.get(
  "/assigned-students",
  protect,
  isAuthorized("Teacher"),
  getAssignedStudents,
);
teacherRouter.get("/files", protect, isAuthorized("Teacher"), getFiles);

export default teacherRouter;
