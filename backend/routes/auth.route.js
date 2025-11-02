import express from "express";

import { login, logout, checkAuth, updateProfile, deleteUser } from "../controllers/auth.controller.js";
import { userprotectRoute } from "../middleware/user.auth.middleware.js";

const router = express.Router();


router.post("/login", login);

router.post("/logout", logout);

router.post("/check", userprotectRoute, checkAuth);

router.put("/update-profile", userprotectRoute, updateProfile);

router.delete("/delete/:userId", deleteUser);

export default router;