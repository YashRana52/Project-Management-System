import express from "express";

import { isAuthorized, protect } from "../middlewares/auth.js";
import { createDeadline } from "../controllers/deadlineController.js";

const deadlineRouter = express.Router();

deadlineRouter.post(
  "/create-deadline/:id",
  protect,
  isAuthorized("Admin"),

  createDeadline,
);

export default deadlineRouter;
