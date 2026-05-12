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
      },
    });

    if (!qr) {
      return next(new ApiError("QR expired or already used", 400));
    }

    // ✅ mark as used ONLY ONE TIME
    qr.used = true;
    await qr.save();

    try {
      // 🚪 OPEN GATE
      await fetch(
        "https://api.thingspeak.com/update?api_key=XRHEHHK35A1DMH1D&field2=1",
        {
          method: "GET",
        }
      );

      // ⏳ WAIT 20s
      setTimeout(async () => {
        try {
          // 🔒 CLOSE GATE
          await fetch(
            "https://api.thingspeak.com/update?api_key=XRHEHHK35A1DMH1D&field2=0",
            {
              method: "GET",
            }
          );

          console.log("field2 reset to 0");
        } catch (err) {
          console.error("ThingSpeak reset error:", err);
        }
      }, 10000);
    } catch (err) {
      console.error("ThingSpeak error:", err);
    }

    // 🚀 RESPONSE TO FRONTEND
    res.status(200).json({
      message: "🚪 Gate opened successfully",
    });

    // 🚀 GENERATE NEW QR
    await generateAndEmitQr();
  }
);

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
//       },
//     });

//     if (!qr) {
//       return next(new ApiError("QR expired or already used", 400));
//     }

//     // ✅ mark as used
//     qr.used = true;
//     await qr.save();

//     // 🚀 TRIGGER THINGSPEAK (OPEN GATE)
//     try {
//       await fetch(
//         "https://api.thingspeak.com/update?api_key=S64WUH2AGF2RLQYU&field2=1",
//         {
//           method: "GET",
//         }
//       );
//     } catch (err) {
//       console.error("ThingSpeak error:", err);
//       // ❗ we do NOT block response if IoT fails
//     }

//     // 🚀 RESPONSE TO FRONTEND
//     res.status(200).json({
//       message: "🚪 Gate opened successfully",
//     });

//     // 🚀 INSTANT NEW QR (NO WAIT)
//     await generateAndEmitQr();
//   }
// );

// ✅ VERIFY QR + INSTANT REFRESH
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
//       },
//     });
//     if (!qr) {
//       return next(new ApiError("QR expired or already used", 400));
//     }

//     // ✅ mark as used
//     qr.used = true;
//     await qr.save();

//     res.status(200).json({
//       message: "🚪 Gate opened successfully",
//     });
//     // 🚀 INSTANT NEW QR (NO WAIT)
//     await generateAndEmitQr();
//   }
// );
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
