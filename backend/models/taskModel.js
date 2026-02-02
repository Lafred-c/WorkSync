// models/Task.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A task must have a title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A task must have a description"],
      trim: true,
    },
    priority: {
      type: String,
      required: [true, "A task must have a priority"],
      enum: {
        values: ["Low", "Medium", "High"],
        message: "Priority must be either Low, Medium, or High",
      },
      default: "Medium",
    },
    dueDate: {
      type: Date,
      required: [true, "A task must have a due date"],
    },
    status: {
      type: String,
      required: [true, "A task must have a status"],
      enum: {
        values: ["Pending", "In Progress", "Completed"],
        message: "Status must be either Pending, In Progress, or Completed",
      },
      default: "Pending",
    },
    project: {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
      default: null,
    },
    assignedTo: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    notes: [
      {
        text: String,
        createdBy: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);

// Index for faster queries
taskSchema.index({status: 1, priority: 1});
taskSchema.index({dueDate: 1});

export const Task = mongoose.model("Task", taskSchema);
