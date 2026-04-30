import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import User, { UserType } from "../models/User";
import factory from "./factoryService";
import ApiError from "../utils/ApiError";
import sendEmail from "../utils/sendEmail";
import activationEmailTemplate from "../utils/emailTemplate/activationEmailTemplate ";

export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, phone, image } = req.body;

    console.log(email, phone, firstName, lastName);
    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      if (existingUser.status === "active") {
        return next(new ApiError("User already exists", 400));
      } else {
        await existingUser.destroy();
      }
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      status: "pending",
      image,
    });

    const activationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(activationToken)
      .digest("hex");

    await user.update({
      activationToken: hashedToken,
      activationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    console.log("/*/*/*/*/*/*/*/*/*/*");
    const activationUrl = `${process.env.FRONTEND_URL}/auth/activate?token=${activationToken}`;
    console.log("/*/*/*/*/*/*/*/*/*/*");
    try {
      console.log(user.firstName, user.email);
      const test = await sendEmail(
        activationEmailTemplate(user.firstName, user.email, activationUrl)
      );
      console.log(test);
      console.log("/*/*/*/*/*/*/*/*/*/*");
    } catch (err) {
      user.activationToken = undefined;
      user.activationTokenExpires = undefined;

      await user.save();

      return next(new ApiError("Error sending email. Try again later.", 500));
    }

    res.status(201).json({
      status: "success",
      message: "User created. Activation email sent.",
      data: { email: user.email },
    });
  }
);

export const getUsers = factory.getAll(User);

export const updateUser = factory.updateOne(User);

export const deleteUser = factory.deleteOne(User);

export const getUser = factory.getOne(User);
