"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
router.post("/refresh-token", auth_controller_1.refreshToken);
// Protected routes (require authentication)
router.post("/logout", auth_1.authenticate, auth_controller_1.logout);
router.get("/profile", auth_1.authenticate, auth_controller_1.getProfile);
exports.default = router;
