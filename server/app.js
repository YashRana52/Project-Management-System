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

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://project-management-system-client-omega.vercel.app",
];

// Add FRONTEND_URL only when it exists
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman, server-to-server requests and allowed frontends
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
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

// Error handler must remain last
app.use(errorMiddleware);

export default app;
