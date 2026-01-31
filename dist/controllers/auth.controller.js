"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("../server");
dotenv_1.default.config();
// Helper function to generate tokens
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: (process.env.ACCESS_TOKEN_EXPIRY ||
            "15m"),
    });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: (process.env.REFRESH_TOKEN_EXPIRY ||
            "7d"),
    });
    return { accessToken, refreshToken };
};
// Register new user
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Validate input
        if (!email || !password || !name) {
            res.status(400).json({
                success: false,
                message: "Please provide email, password, and name",
            });
            return;
        }
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
            return;
        }
        // Create new user
        const user = await User_1.User.create({ email, password, name });
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save();
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
exports.register = register;
// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
            return;
        }
        // Find user and include password field
        const user = await User_1.User.findOne({ email }).select("+password");
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();
        server_1.socketService.emitToAll("user-logged-in", {
            userId: user._id,
            name: user.name,
            timestamp: new Date(),
        });
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
exports.login = login;
// Refresh access token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: "Refresh token is required",
            });
            return;
        }
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // Find user
        const user = await User_1.User.findById(decoded.userId).select("+refreshToken");
        if (!user || user.refreshToken !== refreshToken) {
            res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
            return;
        }
        // Generate new tokens
        const tokens = generateTokens(user._id.toString());
        // Update refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: tokens,
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
        });
    }
};
exports.refreshToken = refreshToken;
// Logout user
const logout = async (req, res) => {
    try {
        const user = req.user;
        if (user) {
            // Clear refresh token
            await User_1.User.findByIdAndUpdate(user._id, { refreshToken: null });
        }
        res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
exports.logout = logout;
// Get current user profile
const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                user: req.user,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
exports.getProfile = getProfile;
