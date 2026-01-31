import { Server, Socket } from "socket.io";

export class SocketService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.initializeHandlers();
  }

  private initializeHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`✅ User connected: ${socket.id}`);

      // Join a room (useful for user-specific or group channels)
      socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
      });

      // Handle chat messages
      socket.on(
        "send-message",
        (data: { room: string; message: string; userId: string }) => {
          // Broadcast to everyone in the room except sender
          socket.to(data.room).emit("receive-message", {
            message: data.message,
            userId: data.userId,
            timestamp: new Date(),
          });
        },
      );

      // Handle typing indicators
      socket.on("typing", (data: { room: string; username: string }) => {
        socket.to(data.room).emit("user-typing", data.username);
      });

      socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
      });
    });
  }

  // Emit to all connected clients
  public emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Emit to a specific room
  public emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  // Emit to a specific socket
  public emitToSocket(socketId: string, event: string, data: any) {
    this.io.to(socketId).emit(event, data);
  }
}
