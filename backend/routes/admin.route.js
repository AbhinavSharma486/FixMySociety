import express from "express";
import { protectAdminRoute } from "../middleware/admin.auth.middleware";
import {
  addResidentToBuilding,
  broadcastGlobalAlert,
  deleteBroadcast,
  deleteComplaintAdmin,
  deleteUser,
  getAllBroadcasts,
  getAllBuildingsAdmin,
  getAllComplaintsAdmin,
  getAllUsers,
  getBuildingByIdAdmin,
  getBuildingOptions,
  getComplaintByIdAdmin,
  getSystemStats,
  updateUserBuildingAndFlat,
  updateUserByAdmin
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

// User Management (Admin)
router.get("/users", protectAdminRoute, getAllUsers);
router.put("/users/:id/building-flat", protectAdminRoute, updateUserBuildingAndFlat);
router.delete("/users/:id", protectAdminRoute, deleteUser);
router.put("/users/:id", protectAdminRoute, updateUserByAdmin);

// Global Alerts (Admin)
router.post("/broadcast-alert", protectAdminRoute, broadcastGlobalAlert);
router.get("/broadcast", protectAdminRoute, getAllBroadcasts);
router.delete("/broadcasts/:id", protectAdminRoute, deleteBroadcast);

export default router;