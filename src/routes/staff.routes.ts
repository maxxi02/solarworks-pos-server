import { Router } from "express";
import {
  createStaff,
  verifyEmail,
  getAllStaff,
  getStaffById,
  updateStaff,
  deactivateStaff,
  reactivateStaff,
  deleteStaff,
  resetStaffPassword,
} from "../controllers/staff.controller";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();

// Public route for email verification
router.get("/verify-email", verifyEmail);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo("admin"));

router.post("/", createStaff);
router.get("/", getAllStaff);
router.get("/:id", getStaffById);
router.put("/:id", updateStaff);
router.patch("/:id/deactivate", deactivateStaff);
router.patch("/:id/reactivate", reactivateStaff);
router.delete("/:id", deleteStaff);
router.post("/:id/reset-password", resetStaffPassword);

export default router;
