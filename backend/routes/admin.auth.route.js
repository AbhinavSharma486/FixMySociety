import express from "express";
import { checkAuth, forgetPassword, login, logout, resetPassword } from "../controllers/admin.auth.controller.js";
import { protectAdminRoute } from "../middleware/admin.auth.middleware.js";

const router = express.Router();

router.post("/login", login);

router.post("/logout", logout);

router.post("/forget-password", forgetPassword);

router.post("/reset-password/:admin_token", resetPassword);

router.get("/check", protectAdminRoute, checkAuth);

export default router;