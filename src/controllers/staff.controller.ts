import { Request, Response } from "express";
import { User } from "../models/User";
import crypto from "crypto";
import { socketService } from "../server";

// Helper function to generate temporary password
const generateTemporaryPassword = (): string => {
  return crypto.randomBytes(8).toString("hex"); // Generates a 16-character password
};

// Create new staff (Admin only)
export const createStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, name, role } = req.body;

    // Validate input
    if (!email || !name) {
      res.status(400).json({
        success: false,
        message: "Please provide email and name",
      });
      return;
    }

    // Validate role
    const validRoles = ["staff", "admin"];
    const staffRole = role || "staff";

    if (!validRoles.includes(staffRole)) {
      res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'staff' or 'admin'",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
      return;
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Create new staff member
    const staff = await User.create({
      email,
      name,
      password: temporaryPassword,
      role: staffRole,
      isFirstLogin: true, // Flag to force password change
    });

    // Emit socket event for new staff creation
    socketService.emitToAll("staff-created", {
      staffId: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      createdBy: req.user?._id,
      timestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      data: {
        staff: {
          id: staff._id,
          email: staff.email,
          name: staff.name,
          role: staff.role,
        },
        temporaryPassword, // Send this ONCE - admin should share with staff
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all staff members (Admin only)
export const getAllStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { role, status, search } = req.query;

    // Build query
    const query: any = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const staff = await User.find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        staff,
        total: staff.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get single staff member (Admin only)
export const getStaffById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id).select("-password -refreshToken");

    if (!staff) {
      res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        staff,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update staff member (Admin only)
export const updateStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const staff = await User.findById(id);

    if (!staff) {
      res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
      return;
    }

    // Update fields
    if (name) staff.name = name;
    if (email) staff.email = email;
    if (role) staff.role = role;
    if (typeof isActive === "boolean") staff.isActive = isActive;

    await staff.save();

    // Emit socket event for staff update
    socketService.emitToAll("staff-updated", {
      staffId: staff._id,
      name: staff.name,
      updatedBy: req.user?._id,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Staff member updated successfully",
      data: {
        staff: {
          id: staff._id,
          email: staff.email,
          name: staff.name,
          role: staff.role,
          isActive: staff.isActive,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Deactivate staff member (Admin only - soft delete)
export const deactivateStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);

    if (!staff) {
      res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
      return;
    }

    staff.isActive = false;
    await staff.save();

    // Emit socket event for staff deactivation
    socketService.emitToAll("staff-deactivated", {
      staffId: staff._id,
      name: staff.name,
      deactivatedBy: req.user?._id,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Staff member deactivated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Reactivate staff member (Admin only)
export const reactivateStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);

    if (!staff) {
      res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
      return;
    }

    staff.isActive = true;
    await staff.save();

    // Emit socket event for staff reactivation
    socketService.emitToAll("staff-reactivated", {
      staffId: staff._id,
      name: staff.name,
      reactivatedBy: req.user?._id,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Staff member reactivated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete staff member permanently (Admin only - use with caution)
export const deleteStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);

    if (!staff) {
      res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
      return;
    }

    // Prevent deleting admin accounts (optional safety measure)
    if (staff.role === "admin") {
      res.status(403).json({
        success: false,
        message: "Cannot delete admin accounts",
      });
      return;
    }

    await User.findByIdAndDelete(id);

    // Emit socket event for staff deletion
    socketService.emitToAll("staff-deleted", {
      staffId: staff._id,
      name: staff.name,
      deletedBy: req.user?._id,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Staff member deleted permanently",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Reset staff password (Admin only)
export const resetStaffPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);

    if (!staff) {
      res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
      return;
    }

    // Generate new temporary password
    const newTemporaryPassword = generateTemporaryPassword();

    staff.password = newTemporaryPassword;
    staff.isFirstLogin = true; // Force password change on next login
    await staff.save();

    // Emit socket event for password reset
    socketService.emitToAll("staff-password-reset", {
      staffId: staff._id,
      name: staff.name,
      resetBy: req.user?._id,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: {
        temporaryPassword: newTemporaryPassword,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
