import dns from 'node:dns';

// Force reliable public DNS servers right at startup
// This fixes most querySrv ECONNREFUSED issues on Windows / restricted networks
dns.setServers(['8.8.8.8', '8.8.4.4']);  // Google DNS
// OR try Cloudflare if Google doesn't work:
// dns.setServers(['1.1.1.1', '1.0.0.1']);

console.log('Using custom DNS servers for MongoDB SRV lookup');
import staffRoutes from "./routes/staff.routes";
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDatabase } from "./config/database";
import { Server } from "socket.io";
import http from "http";
import { SocketService } from "./services/socket.services";

import authRoutes from "./routes/auth.routes";
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 7070;

//create http server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.LIVE_CLIENT_URL
        : process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.LIVE_CLIENT_URL
        : process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);

// Health check route
app.get("/health", (req: Request, res: Response) => {
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
app.use((req: Request, res: Response) => {
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
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const socketService = new SocketService(io);
startServer();

export { socketService };
