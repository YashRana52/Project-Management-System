import express from "express";

import { isAuthorized, protect } from "../middlewares/auth.js";
import { downloadFile } from "../controllers/projectController.js";

const projectRouter = express.Router();

projectRouter.get(
  "/:projectId/files/:fileId/download",
  protect,
  isAuthorized("Admin"),
  downloadFile,
);

export default projectRouter;
