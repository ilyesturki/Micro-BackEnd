import { Sequelize } from "sequelize-typescript";
import User from "../models/User";

import Notification from "../models/Notification";

import DeviceToken from "../models/DeviceToken";

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
      DeviceToken
    ], 
    logging: false,
  });

  return sequelize;
};

export default dbConnect;
