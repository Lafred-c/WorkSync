import express from "express";
import * as projectController from "../controllers/projectController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Protect all routes - require authentication
router.use(authController.protect);

// Project tasks route (must be before /:id to avoid conflicts)
router.route("/:id/tasks").get(projectController.getProjectTasks);

// CRUD routes
router
  .route("/")
  .get(projectController.getAllProjects)
  .post(projectController.createProject);

router
  .route("/:id")
  .get(projectController.getProject)
  .patch(projectController.updateProject)
  .delete(projectController.deleteProject);

export default router;
