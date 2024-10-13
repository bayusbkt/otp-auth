import express from "express";
import {
  getCurrentUser,
  login,
  logout,
  refreshToken,
  regenerateOtpCode,
  register,
  verifyOtpCode,
} from "../Controllers/AuthController.js";
import { adminOnly, authMiddleware, verifiedUserOnly } from "../Middleware/AuthMiddleware.js";
import { getAllUser, verifyUser } from "../Controllers/UserController.js";

const router = express.Router();

router.post("/register", register);
router.post("/regenerate-otp", regenerateOtpCode);
router.post("/verify-otp", verifyOtpCode);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/current-user", authMiddleware, getCurrentUser);
router.post("/refresh-token", authMiddleware, refreshToken);
router.get("/verification", authMiddleware, verifiedUserOnly, verifyUser)

router.get("/user", authMiddleware, adminOnly, getAllUser);

export default router;
