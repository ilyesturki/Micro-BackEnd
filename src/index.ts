import path from "path";
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import dbConnect from "./config/dbConnect";
import globalError from "./middlewares/globalError";
import ApiError from "./utils/ApiError";
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import notificationRoute from "./routes/notificationRoute";
import parkingRoute from "./routes/parkingRoute";
import { setupWebSocket } from "./websocket";
import User from "./models/User";
import Notification from "./models/Notification";

import DeviceToken from "./models/DeviceToken";
import Parking from "./models/Parking";
import ParkingSpot from "./models/ParkingSpot";
import { startThingSpeakWatcher } from "./services/thingspeakWatcherService";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const server = http.createServer(app);
export const io = setupWebSocket(server);

const sequelize = dbConnect();
sequelize.addModels([
  User,
  Notification,
  DeviceToken,
  Parking,
  ParkingSpot
]);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    await sequelize.sync();
    console.log("✅ All models synchronized successfully.");
    startThingSpeakWatcher(io);
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
})();

app.use(cors());
app.options("*", cors());
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/notifications", notificationRoute);
app.use("/parking", parkingRoute);

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError("Can't find this route", 404));
});

app.use(globalError);

const port = parseInt(process.env.PORT || "3000");
server.listen(port, () => {
  console.log(`🚀 Server is running on port : ${port}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(() => {
    console.log("App shutting down...");
    process.exit(1);
  });
});
