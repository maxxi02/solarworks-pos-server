import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected routes (require authentication)
router.post("/logout", authenticate, logout);
router.get("/profile", authenticate, getProfile);

export default router;
