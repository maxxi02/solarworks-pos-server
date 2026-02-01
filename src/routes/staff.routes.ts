import { Router } from "express";
import {
  createStaff,
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

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo("admin"));

// Staff CRUD operations
router.post("/", createStaff); // POST /api/staff
router.get("/", getAllStaff); // GET /api/staff
router.get("/:id", getStaffById); // GET /api/staff/:id
router.put("/:id", updateStaff); // PUT /api/staff/:id

// Staff status management
router.patch("/:id/deactivate", deactivateStaff); // PATCH /api/staff/:id/deactivate
router.patch("/:id/reactivate", reactivateStaff); // PATCH /api/staff/:id/reactivate
router.delete("/:id", deleteStaff); // DELETE /api/staff/:id

// Password management
router.post("/:id/reset-password", resetStaffPassword); // POST /api/staff/:id/reset-password

export default router;
