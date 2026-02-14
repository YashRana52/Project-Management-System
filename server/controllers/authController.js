import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import User from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";

// Register User
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return next(new ErrorHandler("Please provide all required field", 400));
  }

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("user already exists", 400));
  }

  user = await User.create({
    name,
    email,
    role,
    password,
  });

  generateToken(user, 201, "user register successfully", res);
});

// login User
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide all required field", 400));
  }

  let user = await User.findOne({ email, role }).select("+password");
  if (!user) {
    return next(new ErrorHandler("invalid email or role", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("invalid password ", 401));
  }

  generateToken(user, 200, "user login successfully", res);
});

//get user
export const getUser = asyncHandler(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

//logout
export const logout = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

//forgot password
export const forgotPassword = async (req, res) => {
  let user;

  try {
    user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    const resetToken = await user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const message = generateForgotPasswordEmailTemplate({
      resetPasswordUrl,
      resetToken,
    });

    await sendEmail({
      to: user.email,
      subject: "Project Management System - 🔐 Password Reset Request",
      message,
    });

    return res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// resetPassword
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("invalid or expire password reset token", 400),
    );
  }

  if (!req.body.password || !req.body.confirmPassword) {
    return next(new ErrorHandler("please provide all required field", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("password or confirm password are not matched", 400),
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(user, 200, "Password reset succssfully", res);
});
