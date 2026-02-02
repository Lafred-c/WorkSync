import express from "express";
import * as messageController from "../controllers/messageController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router({mergeParams: true});

router.use(authController.protect);

router.route("/").get(messageController.getTeamMessages);

router.route("/mark-read").patch(messageController.markMessagesAsRead);

router
  .route("/:id")
  .patch(messageController.updateMessage)
  .delete(messageController.deleteMessage);

export default router;
