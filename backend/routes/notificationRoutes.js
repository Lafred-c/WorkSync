import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Protect all routes - require authentication
router.use(authController.protect);

// Notification routes
router.route("/").get(notificationController.getMyNotifications);

router.route("/read-all").patch(notificationController.markAllAsRead);

router
  .route("/delete-all")
  .delete(notificationController.deleteAllNotifications);

router.route("/:id").delete(notificationController.deleteNotification);

router.route("/:id/read").patch(notificationController.markAsRead);

export default router;
