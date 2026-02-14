import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./router/userRoutes.js";
import adminRouter from "./router/adminRoutes.js";
import studentRouter from "./router/studentRoutes.js";
import notificationRouter from "./router/notificationRoute.js";
import projectRoute from "./router/projectRoute.js";
import deadlineRouter from "./router/deadlineRouter.js";
import teacherRouter from "./router/teacherRouter.js";

const app = express();

// CORS
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/project", projectRoute);
app.use("/api/v1/deadline", deadlineRouter);
app.use("/api/v1/teacher", teacherRouter);

// Error handler
app.use(errorMiddleware);

export default app;
