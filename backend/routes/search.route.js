import express from "express";

import { userprotectRoute } from "../middleware/user.auth.middleware.js";
import { getSearchFilters, globalSearch } from "../controllers/search.controller.js";

const router = express.Router();

// Search routes (protected)
router.get("/global", userprotectRoute, globalSearch);
router.get("/filters", userprotectRoute, getSearchFilters);

export default router;