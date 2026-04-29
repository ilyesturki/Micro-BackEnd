import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import QrSession  from "../models/QrSession";
import { createTempQRCode } from "../utils/createTempQrCode";

export const startQrGenerator = (io: Server) => {
  setInterval(async () => {
    try {
      const qrId = uuidv4();
      const expiresAt = new Date(Date.now() + 30 * 1000);

      // Save session
      await QrSession.create({
        qrId,
        expiresAt,
        used: false,
      });

      const payload = JSON.stringify({ qrId });

      const qrImage = await createTempQRCode(payload);

      console.log(payload);
      console.log(qrImage);

      io.emit("qr-updated", {
        qr: qrImage,
        qrId,
      });

    } catch (err) {
      console.error("QR generator error:", err);
    }
  }, 30000);
};