import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import { socketAuthMiddleware } from "./middlewares/socketAuth";
import Notification from "./models/Notification";
import { fn, col } from "sequelize";
import ParkingSpot from "./models/ParkingSpot";
import { startQrGenerator } from "./services/qrGeneratorService";
export const setupWebSocket = (server: Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    try {
      console.log(`🟢 User connected: ${socket.data.user.id}`);
      const userId = socket.data.user.id;

      socket.join(`user_${userId}`);

      // DOOR SCREEN ROOM
      socket.on("join-door-screen", () => {
        socket.join("door_screen");
        console.log("🚪 Door screen joined");
      });

      // Notification.count({ where: { userId, status: "unread" } })
      //   .then((unreadCount) =>
      //     socket.emit("unreadNotificationCount", unreadCount)
      //   )
      //   .catch((error) => console.error("Error fetching unread count:", error));

      ParkingSpot.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        attributes: [
          "id",
          "spotNumber",
          "sensorField",
          "status",
          "actionLink",
          "createdAt", 
          [
            fn("DATE_FORMAT", col("createdAt"), "%Y-%m-%d %H:%i:%s"),
            "formattedDate",
          ], 
        ],
      })
        .then((notifications) =>
          socket.emit("parking-updated", notifications)
        )
        .catch((error) =>
          console.error("Error fetching notifications:", error)
        );

      socket.on("disconnect", () => {
        console.log(`🔴 User disconnected: ${userId}`);
      });
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  });

  // START QR SYSTEM
  startQrGenerator(io);
  return io;
};

