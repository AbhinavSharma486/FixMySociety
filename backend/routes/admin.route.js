import express from "express";
import { protectAdminRoute } from "../middleware/admin.auth.middleware";
import { getSystemStats } from "../controllers/admin.controller.js";


const router = express.Router();

// Admin Dashboard and Analytics 
router.get("/analytics", protectAdminRoute, getSystemStats);