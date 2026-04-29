import { Sequelize } from "sequelize-typescript";
import User from "../models/User";

import Notification from "../models/Notification";

import DeviceToken from "../models/DeviceToken";
import Parking from "../models/Parking";
import ParkingSpot from "../models/ParkingSpot";
import QrSession from "../models/QrSession";


const dbConnect = () => {
  const sequelize = new Sequelize({
    dialect: "mysql",
    host: process.env.DB_HOST || "localhost",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "mydb",
    port: Number(process.env.DB_PORT) || 3306,
    models: [
      User,
      Notification,
      DeviceToken,
      Parking,
      ParkingSpot,
      QrSession
    ], 
    logging: false,
  });

  return sequelize;
};

export default dbConnect;
