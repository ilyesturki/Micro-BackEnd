import QRCode from "qrcode";

export const createTempQRCode = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    console.error("QR generation error:", error);
    throw new Error("QR generation failed");
  }
};