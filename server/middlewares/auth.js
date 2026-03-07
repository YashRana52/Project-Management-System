import jwt from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler.js";
import ErrorHandler from "./error.js";
import User from "../models/user.js";

export const protect = asyncHandler(async (req, res, next) => {

  let token;

  // 1️⃣ Cookie se token
  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // 2️⃣ Authorization header se token
  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorHandler("Not authorized, token missing", 401));
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }

  const user = await User.findById(decoded.id).select(
    "-resetPasswordToken -resetPasswordExpire"
  );

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  req.user = user;
  next();
});
