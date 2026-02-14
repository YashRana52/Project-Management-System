import express from "express";

import { protect } from "../middlewares/auth.js";
import {
  deleteAllNotification,
  deleteNotification,
  getNotification,
  markAllAsRead,
  markAsRead,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get(
  "/",
  protect,

  getNotification,
);
notificationRouter.put(
  "/:id/read",
  protect,

  markAsRead,
);
notificationRouter.put(
  "/read-all",
  protect,

  markAllAsRead,
);

notificationRouter.delete(
  "/:id",
  protect,

  deleteNotification,
);
notificationRouter.delete(
  "/delete-all",
  protect,

  deleteAllNotification,
);

export default notificationRouter;
