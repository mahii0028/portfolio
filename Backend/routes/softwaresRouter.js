import express from "express";
import { isAuthenticated } from "../middlewares/isAuth.js";
import {
  addSoftware,
  deleteSoftware,
  getAllSoftwares,
} from "../controller/softwaresController.js";

const router = express.Router();

router.post("/add", isAuthenticated, addSoftware);
router.delete("/delete/:id", isAuthenticated, deleteSoftware);
router.get("/getAll", getAllSoftwares);

export default router;
