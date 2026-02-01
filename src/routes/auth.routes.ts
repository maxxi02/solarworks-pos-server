import { Router } from "express";
import {
  login,
  refreshToken,
  logout,
  getProfile,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected routes (require authentication)
router.post("/logout", protect, logout);
router.get("/profile", protect, getProfile);

export default router;
