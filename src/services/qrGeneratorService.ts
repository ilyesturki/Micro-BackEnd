import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import QrSession from "../models/QrSession";
import { createTempQRCode } from "../utils/createTempQrCode";
import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError";

let ioInstance: Server; // 👈 store io globally

// ✅ REUSABLE FUNCTION
const generateAndEmitQr = async () => {
  try {
    // 🧹 Clean expired QR
    await QrSession.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() },
      },
    });

    const qrId = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 1000);

    await QrSession.create({
      qrId,
      expiresAt,
      used: false,
    });

    const payload = JSON.stringify({ qrId });
    const qrImage = await createTempQRCode(payload);

    console.log(payload);

    ioInstance.emit("qr-updated", {
      qr: qrImage,
      qrId,
    });
  } catch (err) {
    console.error("QR generation error:", err);
  }
};

// ✅ START GENERATOR (called once)
export const startQrGenerator = (io: Server) => {
  ioInstance = io; // 👈 save reference

  setInterval(() => {
    generateAndEmitQr();
  }, 30000);
};

// ✅ VERIFY QR + INSTANT REFRESH
export const verifyQr = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { qrId } = req.body;

    if (!qrId) {
      return next(new ApiError("QR ID required", 400));
    }

    const qr = await QrSession.findOne({
      where: {
        qrId,
        used: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!qr) {
      return next(new ApiError("QR expired or already used", 400));
    }

    // ✅ mark as used
    qr.used = true;
    await qr.save();

    // 🚀 INSTANT NEW QR (NO WAIT)
    await generateAndEmitQr();

    res.status(200).json({
      message: "🚪 Gate opened successfully",
    });
  }
);

// import { Server } from "socket.io";
// import { v4 as uuidv4 } from "uuid";
// import QrSession from "../models/QrSession";
// import { createTempQRCode } from "../utils/createTempQrCode";
// import { NextFunction, Request, Response } from "express";
// import { Op } from "sequelize";
// import asyncHandler from "express-async-handler";
// import ApiError from "../utils/ApiError";

// export const startQrGenerator = (io: Server) => {
//   setInterval(async () => {
//     try {
//       await QrSession.destroy({
//         where: {
//           expiresAt: { [Op.lt]: new Date() },
//         },
//       });

//       const qrId = uuidv4();
//       const expiresAt = new Date(Date.now() + 30 * 1000);

//       // Save session
//       await QrSession.create({
//         qrId,
//         expiresAt,
//         used: false,
//       });

//       const payload = JSON.stringify({ qrId });

//       const qrImage = await createTempQRCode(payload);

//       console.log(payload);
//       console.log(qrImage);

//       io.emit("qr-updated", {
//         qr: qrImage,
//         qrId,
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   }, 30000);
// };

// export const verifyQr = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { qrId } = req.body;

//     if (!qrId) {
//       return next(new ApiError("QR ID required", 400));
//     }

//     const qr = await QrSession.findOne({
//       where: {
//         qrId,
//         used: false,
//         expiresAt: { [Op.gt]: new Date() },
//       },
//     });

//     if (!qr) {
//       return next(new ApiError("QR expired or already used", 400));
//     }

//     // mark as used
//     qr.used = true;
//     await qr.save();

//     // startQrGenerator();
//     // 👉 HERE you trigger gate opening (later IoT / API / etc)

//     res.status(200).json({
//       message: "Gate opened successfully",
//     });
//   }
// );
