import {Message} from "../models/messageModel.js";
import {Team} from "../models/teamModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const getTeamMessages = catchAsync(async (req, res, next) => {
  const {teamId} = req.params;

  // Debug logs (temporary)
  // console.log("TeamID:", teamId);
  // console.log("Req User:", req.user);

  if (!req.user || !req.user._id) {
    return next(
      new AppError("User not authenticated correctly (Internal Error)", 500),
    );
  }

  // Check if team exists
  const team = await Team.findById(teamId);
  if (!team) {
    return next(new AppError("Team not found", 404));
  }

  // Check permissions with try-catch to prevent 500 crash
  let isMember = false;
  let isAdmin = false;

  try {
    isMember = team.isMember(req.user._id);
    isAdmin = team.isAdmin(req.user._id);
  } catch (err) {
    console.error("Permission check failed:", err);
    return next(new AppError(`Permission check failed: ${err.message}`, 500));
  }

  if (!isMember && !isAdmin) {
    return next(
      new AppError("You do not have permission to view this chat", 403),
    );
  }

  const messages = await Message.find({team: teamId})
    .sort("createdAt") // Oldest first
    .populate("sender", "name photo email");

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      messages,
    },
  });
});

// Update a message
export const updateMessage = catchAsync(async (req, res, next) => {
  const {content} = req.body;
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new AppError("Message not found", 404));
  }

  // Check if user is the sender
  if (message.sender._id.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only edit your own messages", 403));
  }

  message.content = content;
  message.isEdited = true; // Flag for UI
  await message.save();

  // Populate sender for return
  await message.populate("sender", "name photo email");

  res.status(200).json({
    status: "success",
    data: {
      message,
    },
  });
});

// Delete a message
export const deleteMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new AppError("Message not found", 404));
  }

  // Check if user is the sender
  if (message.sender._id.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only delete your own messages", 403));
  }

  await Message.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Mark all messages in a team as read for current user
export const markMessagesAsRead = catchAsync(async (req, res, next) => {
  const {teamId} = req.params;

  // Check if team exists and user has access
  const team = await Team.findById(teamId);
  if (!team) {
    return next(new AppError("Team not found", 404));
  }

  const isMember = team.isMember(req.user._id);
  const isAdmin = team.isAdmin(req.user._id);

  if (!isMember && !isAdmin) {
    return next(
      new AppError("You do not have permission to access this team", 403),
    );
  }

  // Update all messages in this team to include current user in readBy
  await Message.updateMany(
    {
      team: teamId,
      readBy: {$ne: req.user._id}, // Only update if user not already in readBy
    },
    {
      $addToSet: {readBy: req.user._id},
    },
  );

  res.status(200).json({
    status: "success",
    message: "Messages marked as read",
  });
});
