import express from "express";

import { isAuthorized, protect } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import {
  downloadFile,
  getAvailableSuperVisors,
  getDashboardStats,
  getFeedback,
  getStudentsProject,
  getSupervisor,
  requestSupervisor,
  submitProposal,
  uploadFiles,
} from "../controllers/studentControllers.js";

const studentRouter = express.Router();

studentRouter.get(
  "/project",
  protect,
  isAuthorized("Student"),
  getStudentsProject,
);
studentRouter.post(
  "/project-proposal",
  protect,
  isAuthorized("Student"),
  submitProposal,
);
studentRouter.post(
  "/upload/:projectId",
  protect,
  isAuthorized("Student"),
  upload.array("files", 10),

  uploadFiles,
);

studentRouter.get(
  "/fetch-supervisors",
  protect,
  isAuthorized("Student"),
  getAvailableSuperVisors,
);
studentRouter.get(
  "/supervisor",
  protect,
  isAuthorized("Student"),
  getSupervisor,
);
studentRouter.post(
  "/request-supervisor",
  protect,
  isAuthorized("Student"),
  requestSupervisor,
);
studentRouter.get(
  "/feedback/:projectId",
  protect,
  isAuthorized("Student"),
  getFeedback,
);
studentRouter.get(
  "/fetch-dashboard-stats",
  protect,
  isAuthorized("Student"),
  getDashboardStats,
);
studentRouter.get(
  "/download/:projectId/:field",
  protect,
  isAuthorized("Student"),
  downloadFile,
);

export default studentRouter;
