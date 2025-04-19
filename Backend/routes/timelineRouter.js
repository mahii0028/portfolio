import express from "express";
import { isAuthenticated } from "../middlewares/isAuth.js";
import {
  postTimeline,
  deleteTimeline,
  getAllTimeline,
} from "../controller/timelineController.js";

const router = express.Router();

router.post("/add", isAuthenticated, postTimeline);
router.delete("/delete/:id", isAuthenticated, deleteTimeline);
router.get("/getAll", getAllTimeline);

export default router;
