import {Project} from "../models/projectModel.js";
import {Task} from "../models/taskModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Create a new project
export const createProject = catchAsync(async (req, res, next) => {
  const {name, description, status, priority, startDate, dueDate} = req.body;

  const newProject = await Project.create({
    name,
    description,
    status,
    priority,
    startDate,
    dueDate,
    admin: req.user._id,
    members: [req.user._id], // Admin is also a member
  });

  res.status(201).json({
    status: "success",
    data: {
      project: newProject,
    },
  });
});

// Get all projects
export const getAllProjects = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = {...req.query};
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filter by status, priority, etc.
  // Add visibility filter: admin or member
  const visibilityFilter = {
    $or: [{admin: req.user._id}, {members: req.user._id}],
  };

  let query = Project.find({...queryObj, ...visibilityFilter});

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

  // Execute query
  const projects = await query;

  res.status(200).json({
    status: "success",
    results: projects.length,
    data: {
      projects,
    },
  });
});

// Get a single project by ID
export const getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new AppError(`Project with ID ${req.params.id} not found`, 404),
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      project,
    },
  });
});

// Update a project
export const updateProject = catchAsync(async (req, res, next) => {
  const {name, description, status, priority, startDate, dueDate} = req.body;

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
    },
    {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators
    },
  );

  if (!project) {
    return next(
      new AppError(`Project with ID ${req.params.id} not found`, 404),
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      project,
    },
  });
});

// Delete a project
export const deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    return next(
      new AppError(`Project with ID ${req.params.id} not found`, 404),
    );
  }

  // Optional: Also delete all tasks associated with this project
  await Task.deleteMany({project: req.params.id});

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get all tasks for a specific project (returns all tasks from task model)
export const getProjectTasks = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new AppError(`Project with ID ${req.params.id} not found`, 404),
    );
  }

  // Find tasks for this project
  const filter = {project: req.params.id};

  // Visibility check:
  // If user is NOT the project admin, only show tasks assigned to them OR unassigned tasks (optional, strictly requested: "assigned will only be the one that user can see")
  // The user request: "the task assigned will only be the only that user can see in that specific project they won't be able to see that tasks if they are not assigned to it"

  // We should check if current user is admin
  // req.user is available because of protect middleware (assumed used on this route)
  const currentUserId = req.user._id;
  const isAdmin =
    project.admin && project.admin.toString() === currentUserId.toString();

  if (!isAdmin) {
    // If not admin, restrict to tasks assigned to this user
    filter.assignedTo = {$in: [currentUserId]};
  }

  const tasks = await Task.find(filter)
    .sort("-createdAt")
    .populate("assignedTo", "name email photo");

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: {
      tasks,
    },
  });
});
