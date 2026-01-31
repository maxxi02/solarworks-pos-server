"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
class SocketService {
    constructor(io) {
        this.io = io;
        this.initializeHandlers();
    }
    initializeHandlers() {
        this.io.on("connection", (socket) => {
            console.log(`✅ User connected: ${socket.id}`);
            // Join a room (useful for user-specific or group channels)
            socket.on("join-room", (roomId) => {
                socket.join(roomId);
                console.log(`User ${socket.id} joined room ${roomId}`);
            });
            // Handle chat messages
            socket.on("send-message", (data) => {
                // Broadcast to everyone in the room except sender
                socket.to(data.room).emit("receive-message", {
                    message: data.message,
                    userId: data.userId,
                    timestamp: new Date(),
                });
            });
            // Handle typing indicators
            socket.on("typing", (data) => {
                socket.to(data.room).emit("user-typing", data.username);
            });
            socket.on("disconnect", () => {
                console.log(`❌ User disconnected: ${socket.id}`);
            });
        });
    }
    // Emit to all connected clients
    emitToAll(event, data) {
        this.io.emit(event, data);
    }
    // Emit to a specific room
    emitToRoom(room, event, data) {
        this.io.to(room).emit(event, data);
    }
    // Emit to a specific socket
    emitToSocket(socketId, event, data) {
        this.io.to(socketId).emit(event, data);
    }
}
exports.SocketService = SocketService;
