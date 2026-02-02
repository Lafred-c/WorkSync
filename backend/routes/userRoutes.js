import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);
router.post("/logout", authController.logOut);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

// Protected routes (require authentication)
router.use(authController.protect); // All routes after this middleware require authentication

router.patch("/updateMe", authController.updateMe);
router.patch("/updatePassword", authController.updatePassword);
router.get("/me", authController.getMe, authController.getOne);
router.get("/", authController.getAll);
router.get("/:id", authController.getOne);

export default router;
