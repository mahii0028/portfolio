import express from "express";
import {
  register,
  userLogin,
  userLogout,
  getUser,
  updateProfile,
  updatePassword,
  getUserForPortfolio,
  forgotPassword
} from "../controller/userController.js";
import { isAuthenticated } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", userLogin);
router.get("/logout", isAuthenticated, userLogout);
router.get("/me", isAuthenticated, getUser);
router.put("/update/me", isAuthenticated, updateProfile);
router.put("/update/password", isAuthenticated, updatePassword);
router.get("/me/portfolio", getUserForPortfolio);
router.post("/password/forgot", forgotPassword);
export default router;
