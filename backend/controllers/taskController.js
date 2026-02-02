import {Task} from "../models/taskModel.js";
import User from "../models/userModels.js";
import {Project} from "../models/projectModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import {createNotification} from "./notificationController.js";

// Create a new task
export const createTask = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    priority,
    dueDate,
    status,
    project,
    assigneeEmail,
    note,
  } = req.body;

  let assignedTo = [];
  if (assigneeEmail) {
    const user = await User.findOne({email: assigneeEmail});
    if (!user) {
      return next(
        new AppError(`User with email ${assigneeEmail} not found`, 404),
      );
    }
    assignedTo.push(user._id);
  }

  const newTask = await Task.create({
    title,
    description,
    priority,
    dueDate,
    status,
    project,
    assignedTo,
    notes: note
      ? [{text: note, createdBy: req.user._id, createdAt: Date.now()}]
      : [],
  });

  // If assigned to a user, add them to project members if not already there
  if (assignedTo.length > 0 && project) {
    await Project.findByIdAndUpdate(
      project,
      {$addToSet: {members: {$each: assignedTo}}},
      {new: true},
    );

    // Notify assigned users
    const projectDoc = await Project.findById(project);
    for (const userId of assignedTo) {
      await createNotification({
        recipient: userId,
        type: "task_assigned",
        message: `${req.user.name} assigned "${title}" to you`,
        relatedTask: newTask._id,
        triggeredBy: req.user._id,
      });
    }
  }

  res.status(201).json({
    status: "success",
    data: {
      task: newTask,
    },
  });
});

// Get all tasks
export const getAllTasks = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = {...req.query};
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filter by status, priority, etc.
  let query = Task.find(queryObj);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt"); // Default: newest first
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Determine visibility
  // Find projects where user is admin
  const myAdminProjects = await Project.find({admin: req.user._id}).select(
    "_id",
  );
  const myAdminProjectIds = myAdminProjects.map((p) => p._id);

  const visibilityFilter = {
    $or: [
      {assignedTo: {$in: [req.user._id]}},
      {project: {$in: myAdminProjectIds}},
    ],
  };

  // Execute query with visibility filter
  const tasks = await Task.find({...queryObj, ...visibilityFilter}).sort(
    "-createdAt",
  );

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

// Get a single task by ID
export const getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError(`Task with ID ${req.params.id} not found`, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

// Update a task
export const updateTask = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    priority,
    dueDate,
    status,
    assigneeEmail,
    removeAssigneeId,
    note,
  } = req.body;

  // 1. Fetch task to check permissions
  let task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError(`Task with ID ${req.params.id} not found`, 404));
  }

  // 2. Fetch project to check admin status
  // We need the project to know who the admin is.
  // Assuming task has a populated project or we need to fetch it.
  // Task model definition shows 'project' is ref.
  const project = await Project.findById(task.project);
  if (!project) {
    return next(new AppError("Project for this task not found", 404));
  }

  const userId = req.user._id;
  const isAdmin = project.admin.toString() === userId.toString();
  // Check if user is in assignedTo array. assignedTo is array of IDs.
  // We need to handle if assignedTo is not populated (it is ObjectId array).
  const isAssignee = task.assignedTo.some(
    (id) => id.toString() === userId.toString(),
  );

  if (!isAdmin && !isAssignee) {
    return next(
      new AppError("You are not authorized to update this task", 403),
    );
  }

  // 3. Enforce restrictions
  // valid fields for assignee: status, priority
  // We strictly construct updateQuery below based on role, so we don't need to throw error here
  // if extra fields are present (as frontend might send full object).
  // We just ignore them for non-admins.

  let updateQuery = {};

  if (isAdmin) {
    // Admin can update everything
    if (title) updateQuery.title = title;
    if (description) updateQuery.description = description;
    if (priority) updateQuery.priority = priority;
    if (dueDate) updateQuery.dueDate = dueDate;
    if (status) updateQuery.status = status;

    // Handle adding new assignee
    if (assigneeEmail) {
      const user = await User.findOne({email: assigneeEmail});
      if (!user) {
        return next(
          new AppError(`User with email ${assigneeEmail} not found`, 404),
        );
      }

      await Project.findByIdAndUpdate(task.project, {
        $addToSet: {members: user._id},
      });

      // Add to assignedTo array using $addToSet to avoid duplicates
      updateQuery.$addToSet = {assignedTo: user._id};
    }

    // Handle adding note
    if (note) {
      if (!updateQuery.$push) updateQuery.$push = {};
      updateQuery.$push.notes = {
        text: note,
        createdBy: req.user._id,
        createdAt: Date.now(),
      };
    }

    // Handle removing assignee
    if (removeAssigneeId) {
      // If adding and removing, handle carefully. Prioritize add logic above?
      // If updateQuery has $addToSet, we can't add $pull easily in same level.
      // Assuming separate calls or prioritize one.
      if (!assigneeEmail) {
        updateQuery.$pull = {assignedTo: removeAssigneeId};
      }
    }
  } else {
    if (status) updateQuery.status = status;
    if (priority) updateQuery.priority = priority;
    // Assignee can add notes
    if (note) {
      if (!updateQuery.$push) updateQuery.$push = {};
      updateQuery.$push.notes = {
        text: note,
        createdBy: req.user._id,
        createdAt: Date.now(),
      };
    }
  }

  // If nothing to update
  if (Object.keys(updateQuery).length === 0) {
    // Just return existing task
    return res.status(200).json({
      status: "success",
      data: {
        task,
      },
    });
  }

  // Detect status change for notification
  const oldStatus = task.status;
  const newStatus = status;

  task = await Task.findByIdAndUpdate(req.params.id, updateQuery, {
    new: true, // Return the updated document
    runValidators: true, // Run schema validators
  });

  // Notify admin if status changed by assignee
  if (newStatus && oldStatus !== newStatus && !isAdmin) {
    await createNotification({
      recipient: project.admin,
      type: "task_status_change",
      message: `${req.user.name} changed "${task.title}" status to ${newStatus}`,
      relatedTask: task._id,
      triggeredBy: req.user._id,
    });
  }

  // Notify all assignees (except note creator) if note was added
  if (note) {
    for (const assigneeId of task.assignedTo) {
      if (assigneeId.toString() !== req.user._id.toString()) {
        await createNotification({
          recipient: assigneeId,
          type: "note_added",
          message: `${req.user.name} added a note to "${task.title}"`,
          relatedTask: task._id,
          triggeredBy: req.user._id,
        });
      }
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

// Delete a task
export const deleteTask = catchAsync(async (req, res, next) => {
  // 1. Fetch task
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError(`Task with ID ${req.params.id} not found`, 404));
  }

  // 2. Fetch project for admin check
  const project = await Project.findById(task.project);
  if (!project) {
    // If orphan task or project gone, maybe allow delete? Safety first.
    return next(new AppError("Project Not Found", 404));
  }

  const isAdmin = project.admin.toString() === req.user._id.toString();

  if (!isAdmin) {
    return next(new AppError("Only project admins can delete tasks", 403));
  }

  // 3. Delete
  await Task.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get task statistics (bonus feature)
export const getTaskStats = catchAsync(async (req, res, next) => {
  const stats = await Task.aggregate([
    {
      $group: {
        _id: "$status",
        count: {$sum: 1},
        avgPriority: {$avg: "$priority"},
      },
    },
    {
      $sort: {count: -1},
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

// Get dashboard statistics
export const getDashboardStats = catchAsync(async (req, res, next) => {
  const now = new Date();
  const userId = req.user._id;

  // Find projects where user is admin
  const myAdminProjects = await Project.find({admin: userId}).select("_id");
  const myAdminProjectIds = myAdminProjects.map((p) => p._id);

  // Filter: Tasks assigned to me OR Tasks in projects I admin
  const visibilityFilter = {
    $or: [{assignedTo: {$in: [userId]}}, {project: {$in: myAdminProjectIds}}],
  };

  // Get all visible tasks
  const allTasks = await Task.find(visibilityFilter);

  // Calculate statistics
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(
    (task) => task.status === "Completed",
  ).length;
  const inProgressTasks = allTasks.filter(
    (task) => task.status === "In Progress",
  ).length;
  const pendingTasks = allTasks.filter(
    (task) => task.status === "Pending",
  ).length;

  // Calculate overdue tasks (tasks with dueDate in the past and not completed)
  const overdueTasks = allTasks.filter((task) => {
    if (task.status === "Completed") return false;
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < now;
  }).length;

  // Tasks by priority
  const tasksByPriority = {
    Low: allTasks.filter((task) => task.priority === "Low").length,
    Medium: allTasks.filter((task) => task.priority === "Medium").length,
    High: allTasks.filter((task) => task.priority === "High").length,
  };

  // Tasks by status
  const tasksByStatus = {
    Pending: pendingTasks,
    "In Progress": inProgressTasks,
    Completed: completedTasks,
  };

  res.status(200).json({
    status: "success",
    data: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      tasksByPriority,
      tasksByStatus,
    },
  });
});

// Get weekly task statistics for charts
export const getWeeklyTaskStats = catchAsync(async (req, res, next) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  // Set to start of day
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Find projects where user is admin
  const myAdminProjects = await Project.find({admin: req.user._id}).select(
    "_id",
  );
  const myAdminProjectIds = myAdminProjects.map((p) => p._id);

  const visibilityFilter = {
    $or: [
      {assignedTo: {$in: [req.user._id]}},
      {project: {$in: myAdminProjectIds}},
    ],
  };

  const weeklyData = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(sevenDaysAgo);
    currentDate.setDate(sevenDaysAgo.getDate() + i);

    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    // Count tasks created on this day
    const created = await Task.countDocuments({
      ...visibilityFilter,
      createdAt: {
        $gte: currentDate,
        $lt: nextDate,
      },
    });

    // Count tasks completed on this day
    const completed = await Task.countDocuments({
      ...visibilityFilter,
      status: "Completed",
      updatedAt: {
        $gte: currentDate,
        $lt: nextDate,
      },
    });

    // Count tasks in progress at end of day
    const inProgress = await Task.countDocuments({
      ...visibilityFilter,
      status: "In Progress",
      createdAt: {$lte: nextDate},
    });

    weeklyData.push({
      date: currentDate.toISOString().split("T")[0],
      day: dayNames[currentDate.getDay()],
      created,
      completed,
      inProgress,
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      weeklyData,
    },
  });
});
