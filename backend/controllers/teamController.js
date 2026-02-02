import {Team} from "../models/teamModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import {createNotification} from "./notificationController.js";

// Create a new team (creator becomes admin)
export const createTeam = catchAsync(async (req, res, next) => {
  const {name, description, image} = req.body;

  const newTeam = await Team.create({
    name,
    description,
    image: image || null,
    admin: req.user._id, // Set creator as admin
    members: [], // Start with empty members array
  });

  res.status(201).json({
    status: "success",
    data: {
      team: newTeam,
    },
  });
});

// Get all teams where user is admin or member
export const getAllTeams = catchAsync(async (req, res, next) => {
  const teams = await Team.find({
    $or: [
      {admin: req.user._id}, // Teams where user is admin
      {"members.user": req.user._id}, // Teams where user is a member
    ],
  })
    .populate("admin", "name email")
    .populate("members.user", "name email")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: teams.length,
    data: {
      teams,
    },
  });
});

// Get a single team by ID
export const getTeam = catchAsync(async (req, res, next) => {
  const team = await Team.findById(req.params.id)
    .populate("admin", "name email")
    .populate("members.user", "name email");

  if (!team) {
    return next(new AppError(`Team with ID ${req.params.id} not found`, 404));
  }

  // Check if user has access (admin or member)
  const isAdmin = team.isAdmin(req.user._id);
  const isMember = team.isMember(req.user._id);

  if (!isAdmin && !isMember) {
    return next(
      new AppError("You do not have permission to access this team", 403),
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      team,
    },
  });
});

// Update team info (admin only)
export const updateTeam = catchAsync(async (req, res, next) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return next(new AppError(`Team with ID ${req.params.id} not found`, 404));
  }

  // Check if user is admin
  if (!team.isAdmin(req.user._id)) {
    return next(
      new AppError("Only team admin can update team information", 403),
    );
  }

  const {name, description, image} = req.body;

  // Build update object - only include image if it's provided
  const updateData = {name, description};
  if (image !== undefined) {
    updateData.image = image;
  }

  const updatedTeam = await Team.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("admin", "name email")
    .populate("members.user", "name email");

  res.status(200).json({
    status: "success",
    data: {
      team: updatedTeam,
    },
  });
});

// Delete team (admin only)
export const deleteTeam = catchAsync(async (req, res, next) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return next(new AppError(`Team with ID ${req.params.id} not found`, 404));
  }

  // Check if user is admin
  if (!team.isAdmin(req.user._id)) {
    return next(new AppError("Only team admin can delete the team", 403));
  }

  await Team.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get team statistics for dashboard
export const getTeamStats = catchAsync(async (req, res, next) => {
  // Get all teams where user is admin or member
  const allTeams = await Team.find({
    $or: [{admin: req.user._id}, {"members.user": req.user._id}],
  }).populate("members.user");

  const totalTeams = allTeams.length;
  const teamsAsAdmin = allTeams.filter(
    (team) => team.admin.toString() === req.user._id.toString(),
  ).length;
  const teamsAsMember = totalTeams - teamsAsAdmin;

  // Calculate total unique members across all teams
  const uniqueMembers = new Set();
  allTeams.forEach((team) => {
    // Add admin
    uniqueMembers.add(team.admin.toString());
    // Add all members
    team.members.forEach((member) => {
      uniqueMembers.add(member.user._id.toString());
    });
  });

  const totalMembers = uniqueMembers.size;

  res.status(200).json({
    status: "success",
    data: {
      totalTeams,
      totalMembers,
      teamsAsAdmin,
      teamsAsMember,
    },
  });
});

// Add member to team (admin only)
export const addMember = catchAsync(async (req, res, next) => {
  const {userId, role = "Member"} = req.body;

  const team = await Team.findById(req.params.id);

  if (!team) {
    return next(new AppError(`Team with ID ${req.params.id} not found`, 404));
  }

  // Debug logs
  console.log("addMember - User:", req.user);
  console.log("addMember - Body:", req.body);
  console.log("addMember - Team:", team);

  if (!req.user || !req.user._id) {
    return next(new AppError("User authentication failed", 401));
  }

  // Check if user is admin
  if (!team.isAdmin(req.user._id)) {
    return next(new AppError("Only team admin can add members", 403));
  }

  // Check if user is already a member
  if (team.isMember(userId)) {
    return next(new AppError("User is already a member of this team", 400));
  }

  // Validate role
  if (!["Manager", "Member"].includes(role)) {
    return next(new AppError("Role must be either Manager or Member", 400));
  }

  // Add member
  team.members.push({
    user: userId,
    role,
    joinedAt: Date.now(),
  });

  await team.save();

  const updatedTeam = await Team.findById(req.params.id)
    .populate("admin", "name email")
    .populate("members.user", "name email");

  // Notify the newly added member
  await createNotification({
    recipient: userId,
    type: "team_added",
    message: `You were added by ${req.user.name} to ${team.name}`,
    relatedTeam: team._id,
    triggeredBy: req.user._id,
  });

  res.status(200).json({
    status: "success",
    data: {
      team: updatedTeam,
    },
  });
});

// Update member role (admin only)
export const updateMemberRole = catchAsync(async (req, res, next) => {
  const {role} = req.body;
  const {userId} = req.params;

  const team = await Team.findById(req.params.id);

  if (!team) {
    return next(new AppError(`Team with ID ${req.params.id} not found`, 404));
  }

  // Check if user is admin
  if (!team.isAdmin(req.user._id)) {
    return next(new AppError("Only team admin can update member roles", 403));
  }

  // Validate role
  if (!["Manager", "Member"].includes(role)) {
    return next(new AppError("Role must be either Manager or Member", 400));
  }

  // Find and update member
  const memberIndex = team.members.findIndex(
    (m) => m.user.toString() === userId,
  );

  if (memberIndex === -1) {
    return next(new AppError("User is not a member of this team", 404));
  }

  team.members[memberIndex].role = role;
  await team.save();

  const updatedTeam = await Team.findById(req.params.id)
    .populate("admin", "name email")
    .populate("members.user", "name email");

  res.status(200).json({
    status: "success",
    data: {
      team: updatedTeam,
    },
  });
});

// Remove member from team (admin only)
export const removeMember = catchAsync(async (req, res, next) => {
  const {userId} = req.params;

  const team = await Team.findById(req.params.id);

  if (!team) {
    return next(new AppError(`Team with ID ${req.params.id} not found`, 404));
  }

  // Check if user is admin
  if (!team.isAdmin(req.user._id)) {
    return next(new AppError("Only team admin can remove members", 403));
  }

  // Check if trying to remove admin
  if (team.admin.toString() === userId) {
    return next(new AppError("Cannot remove team admin", 400));
  }

  // Find member
  const memberIndex = team.members.findIndex(
    (m) => m.user.toString() === userId,
  );

  if (memberIndex === -1) {
    return next(new AppError("User is not a member of this team", 404));
  }

  // Remove member
  team.members.splice(memberIndex, 1);
  await team.save();

  const updatedTeam = await Team.findById(req.params.id)
    .populate("admin", "name email")
    .populate("members.user", "name email");

  res.status(200).json({
    status: "success",
    data: {
      team: updatedTeam,
    },
  });
});

// Get unread message counts for all user's teams

export const getUnreadCounts = catchAsync(async (req, res, next) => {
  const {Message} = await import("../models/messageModel.js");

  // Get all teams where user is admin or member
  const teams = await Team.find({
    $or: [{admin: req.user._id}, {"members.user": req.user._id}],
  }).select("_id");

  const teamIds = teams.map((t) => t._id);

  // For each team, count messages where user is NOT in readBy array
  const unreadCounts = {};

  for (const teamId of teamIds) {
    const count = await Message.countDocuments({
      team: teamId,
      readBy: {$ne: req.user._id}, // Messages not read by current user
    });
    unreadCounts[teamId.toString()] = count;
  }

  res.status(200).json({
    status: "success",
    data: {
      unreadCounts,
    },
  });
});
