import express from "express";

import { protectAdminRoute } from "../middleware/admin.auth.middleware.js";
import {
  createBuilding,
  deleteBuilding,
  getAllBuildings,
  getBuildingById,
  getBuildingStats,
  updateBuilding
} from "../controllers/building.controller.js";

const router = express.Router();

// All building routes are admin protected
router.post("/create", protectAdminRoute, createBuilding);
router.get("/all", protectAdminRoute, getAllBuildings);
router.get("/:id", protectAdminRoute, getBuildingById);
router.put("/:id", protectAdminRoute, updateBuilding);
router.delete("/:id", protectAdminRoute, deleteBuilding);
router.get("/:id/stats", protectAdminRoute, getBuildingStats);

export default router;