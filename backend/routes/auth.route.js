import express from "express";

import { signup, login, logout, verifyEmail, checkAuth, forgetPassword, resetPassword } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/verify-email", verifyEmail);

router.post("/login", login);

router.post("/logout", logout);

router.get("/check", protectRoute, checkAuth);

router.post("/forget-password", forgetPassword);

router.post("/reset-password/:token", resetPassword);

export default router;