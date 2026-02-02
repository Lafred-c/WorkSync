import express from "express";
import * as taskController from "../controllers/taskController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Protect all routes - require authentication
router.use(authController.protect);

// Statistics routes (should be before /:id to avoid conflicts)
router.route("/stats/dashboard").get(taskController.getDashboardStats);
router.route("/stats/weekly").get(taskController.getWeeklyTaskStats);
router.route("/stats").get(taskController.getTaskStats);

// CRUD routes
router
  .route("/")
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router
  .route("/:id")
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

export default router;
