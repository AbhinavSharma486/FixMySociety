import express from "express";
import { protectAdminRoute } from "../middleware/admin.auth.middleware";
import {
  deleteComplaintAdmin,
  getAllComplaintsAdmin,
  getComplaintByIdAdmin,
  getSystemStats
} from "../controllers/admin.controller.js";


const router = express.Router();

// Admin Dashboard and Analytics 
router.get("/analytics", protectAdminRoute, getSystemStats);

// Complaint Management (Admin)
router.get("/complaints", protectAdminRoute, getAllComplaintsAdmin);
router.get("/complaints/:id", protectAdminRoute, getComplaintByIdAdmin);
router.delete("/complaints/:id", protectAdminRoute, deleteComplaintAdmin);