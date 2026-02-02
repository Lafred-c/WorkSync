import express from "express";
import * as teamController from "../controllers/teamController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// All routes require authentication
router.use(authController.protect);

// Statistics route
router.route("/stats").get(teamController.getTeamStats);

// Unread counts route
router.route("/unread-counts").get(teamController.getUnreadCounts);

// Team CRUD routes
router
  .route("/")
  .get(teamController.getAllTeams) // Get all teams user is part of
  .post(teamController.createTeam); // Create new team (user becomes admin)

router
  .route("/:id")
  .get(teamController.getTeam) // Get single team
  .patch(teamController.updateTeam) // Update team (admin only)
  .delete(teamController.deleteTeam); // Delete team (admin only)

// Member management routes
router.post("/:id/members", teamController.addMember); // Add member (admin only)

router
  .route("/:id/members/:userId")
  .patch(teamController.updateMemberRole) // Update member role (admin only)
  .delete(teamController.removeMember); // Remove member (admin only)

export default router;
