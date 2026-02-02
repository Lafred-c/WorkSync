// models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A project must have a name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A project must have a description"],
      trim: true,
    },
    status: {
      type: String,
      required: [true, "A project must have a status"],
      enum: {
        values: ["Active", "On Hold", "Completed"],
        message: "Status must be either Active, On Hold, or Completed",
      },
      default: "Active",
    },
    priority: {
      type: String,
      required: [true, "A project must have a priority"],
      enum: {
        values: ["Low", "Medium", "High"],
        message: "Priority must be either Low, Medium, or High",
      },
      default: "Medium",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "A project must have a due date"],
    },
    admin: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A project must have an admin"],
    },
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);

// Virtual populate for tasks
projectSchema.virtual("tasks", {
  ref: "Task",
  foreignField: "project",
  localField: "_id",
});

// Index for faster queries
projectSchema.index({status: 1, priority: 1});
projectSchema.index({dueDate: 1});

export const Project = mongoose.model("Project", projectSchema);
