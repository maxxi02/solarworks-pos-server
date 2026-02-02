import { Router } from "express";
import {
  login,
  refreshToken,
  logout,
  getProfile,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth";
import { verifyEmail } from "../controllers/staff.controller";

const router = Router();

// Public routes
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/verify-email", verifyEmail);

// Protected routes (require authentication)
router.post("/logout", protect, logout);
router.get("/profile", protect, getProfile);

export default router;
