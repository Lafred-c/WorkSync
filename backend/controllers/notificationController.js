import {Notification} from "../models/notificationModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Get all notifications for the logged-in user
export const getMyNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({recipient: req.user._id})
    .populate("triggeredBy", "name email")
    .populate("relatedTask", "title")
    .populate("relatedTeam", "name")
    .sort("-createdAt")
    .limit(50); // Limit to 50 most recent

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    status: "success",
    results: notifications.length,
    unreadCount,
    data: {
      notifications,
    },
  });
});

// Mark a notification as read
export const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {_id: req.params.id, recipient: req.user._id},
    {isRead: true},
    {new: true, runValidators: true},
  );

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      notification,
    },
  });
});

// Mark all notifications as read
export const markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    {recipient: req.user._id, isRead: false},
    {isRead: true},
  );

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  });
});

// Delete a notification
export const deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Delete all notifications for current user
export const deleteAllNotifications = catchAsync(async (req, res, next) => {
  await Notification.deleteMany({recipient: req.user._id});

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Helper function to create a notification (used by other controllers)
export const createNotification = async ({
  recipient,
  type,
  message,
  relatedTask = null,
  relatedTeam = null,
  triggeredBy,
}) => {
  try {
    console.log("Creating notification:", {recipient, type, message});
    const notification = await Notification.create({
      recipient,
      type,
      message,
      relatedTask,
      relatedTeam,
      triggeredBy,
    });
    console.log("Notification created successfully:", notification._id);
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
    throw err;
  }
};
