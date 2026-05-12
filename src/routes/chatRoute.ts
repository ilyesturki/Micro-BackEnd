import express from "express";
import { chatService } from "../services/chatService";

const router = express.Router();

// router.use(protect);
router.post("/", chatService);

export default router;
