import express from "express";

import { protect } from "../services/authService";
import { getParkingSpots } from "../services/parkingService";

const router = express.Router();

router.use(protect);
router
  .route("/")
  .get(getParkingSpots);
  


export default router;
