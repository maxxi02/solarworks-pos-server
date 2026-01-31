"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 7070;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production"
        ? process.env.LIVE_CLIENT_URL
        : process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api/auth", auth_routes_1.default);
// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
// Start server
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        // Start listening
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV}`);
            console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
