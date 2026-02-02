import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Notification must have a recipient"],
    },
    type: {
      type: String,
      required: [true, "Notification must have a type"],
      enum: {
        values: [
          "task_status_change",
          "task_assigned",
          "team_added",
          "note_added",
        ],
        message:
          "Type must be task_status_change, task_assigned, team_added, or note_added",
      },
    },
    message: {
      type: String,
      required: [true, "Notification must have a message"],
      trim: true,
    },
    relatedTask: {
      type: mongoose.Schema.ObjectId,
      ref: "Task",
      default: null,
    },
    relatedTeam: {
      type: mongoose.Schema.ObjectId,
      ref: "Team",
      default: null,
    },
    triggeredBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Notification must have a triggeredBy user"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);

// Index for faster queries
notificationSchema.index({recipient: 1, createdAt: -1});
notificationSchema.index({isRead: 1});

export const Notification = mongoose.model("Notification", notificationSchema);
