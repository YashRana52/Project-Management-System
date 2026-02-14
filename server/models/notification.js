import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user Id is required"],
      index: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],

      trim: true,
      maxlength: [500, "Message cannot be more than 500 characters"],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: [
        "request",
        "approval",
        "rejection",
        "feedback",
        "deadline",
        "general",
        "meeting",
        "system",
      ],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },
  },
  { timestamps: true },
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
