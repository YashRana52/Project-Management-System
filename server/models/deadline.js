import mongoose from "mongoose";

const deadlineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Deadline name/title is required"],
      trim: true,
      maxlength: [100, "Deadline title cannot be more than 100 characters"],
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
      index: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

// Compound index for fast queries
deadlineSchema.index({ project: 1, dueDate: 1 });

export const Deadline =
  mongoose.models.Deadline || mongoose.model("Deadline", deadlineSchema);
