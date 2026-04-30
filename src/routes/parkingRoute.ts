import express from "express";

import { allowedTo, protect } from "../services/authService";
import { getParkingSpots } from "../services/parkingService";
import { verifyQr } from "../services/qrGeneratorService";

const router = express.Router();

// router.use(protect);
router.route("/").get(getParkingSpots);

router.use(allowedTo("admin"));

router.post("/door", verifyQr);

export default router;
