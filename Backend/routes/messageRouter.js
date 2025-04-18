import express from "express";
import {
  sendMessage,
  getAllMessages,
  deleteMessage,
} from "../controller/messageController.js";
import { isAuthenticated } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/all", getAllMessages);
router.delete("/delete/:id", isAuthenticated, deleteMessage);

export default router;
