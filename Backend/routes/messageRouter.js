import express from "express";
import {
  sendMessage,
  getAllMessages,
} from "../controller/messageController.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/all", getAllMessages);
export default router;
