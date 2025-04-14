import express from "express";

import { signup, login, logout, verifyEmail, checkAuth, forgetPassword, resetPassword, updateProfile, deleteUser } from "../controllers/auth.controller.js";
import { userprotectRoute } from "../middleware/user.auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/verify-email", verifyEmail);

router.post("/login", login);

router.post("/logout", logout);

router.get("/check", userprotectRoute, checkAuth);

router.post("/forget-password", forgetPassword);

router.post("/reset-password/:token", resetPassword);

router.put("/update-profile", userprotectRoute, updateProfile);

router.delete("/delete/:userId", deleteUser);

export default router;