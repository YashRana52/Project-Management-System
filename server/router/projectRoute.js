import express from "express";

import { isAuthorized, protect } from "../middlewares/auth.js";
import { downloadFile, previewFile } from "../controllers/projectController.js";

const projectRouter = express.Router();

projectRouter.get(
  "/:projectId/files/:fileId/download",
  protect,
  isAuthorized(
    "Admin",
    "Student",
    "Teacher",
  ),
  downloadFile,
);


projectRouter.get(
  "/:projectId/files/:fileId/preview",

  protect,

  isAuthorized(
    "Admin",
    "Student",
    "Teacher",
  ),

  previewFile,
);

export default projectRouter;
