"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const socket_services_1 = require("./services/socket.services");
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 7070;
//create http server
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production"
            ? process.env.LIVE_CLIENT_URL
            : process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production"
        ? process.env.LIVE_CLIENT_URL
        : process.env.CLIENT_URL,
    credentials: true,
}));
app.use((0, cors_1.default)());
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
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "POS Server API is running",
        version: "1.0.0",
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on("message", (data) => {
        console.log(`Message received:`, data);
        socket.emit("message", { text: "message received" });
        socket.on("disconnect", () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
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
const socketService = new socket_services_1.SocketService(io);
exports.socketService = socketService;
startServer();
