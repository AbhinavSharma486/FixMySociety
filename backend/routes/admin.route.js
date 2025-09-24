import express from "express";
import { protectAdminRoute } from "../middleware/admin.auth.middleware";
import {
  addResidentToBuilding,
  deleteComplaintAdmin,
  getAllBuildingsAdmin,
  getAllComplaintsAdmin,
  getBuildingByIdAdmin,
  getBuildingOptions,
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

// Building Management (Admin)
router.get("/buildings", protectAdminRoute, getAllBuildingsAdmin);
router.get("/buildings/options", protectAdminRoute, getBuildingOptions);
router.get("/buildings/:id", protectAdminRoute, getBuildingByIdAdmin);
router.post("/buildings/:id/residents", protectAdminRoute, addResidentToBuilding);