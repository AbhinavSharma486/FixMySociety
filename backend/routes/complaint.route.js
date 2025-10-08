import express from "express";

import { userprotectRoute } from "../middleware/user.auth.middleware.js";
import { protectAdminRoute } from "../middleware/admin.auth.middleware.js";
import { userOrAdminProtect } from "../middleware/userOrAdmin.auth.middleware.js";
import {
  addComment,
  createComplaint,
  deleteComment,
  deleteComplaint,
  editComment,
  getAllComplaints,
  getComplaintById,
  likeComplaint,
  updateComplaint,
  updateComplaintStatus
} from "../controllers/complaint.controller.js";

const router = express.Router();

// User complaint routes
// Support both RESTful and explicit paths expected by frontend
router.post("/", userprotectRoute, createComplaint);
router.post("/create", userprotectRoute, createComplaint);
router.get("/", userprotectRoute, getAllComplaints);
router.get("/all", userprotectRoute, getAllComplaints);
router.get("/:id", userprotectRoute, getComplaintById);
router.put("/:id", userprotectRoute, updateComplaint);
router.delete("/:id", userprotectRoute, deleteComplaint);
router.post("/:id/like", userprotectRoute, likeComplaint);

// Allow either user or admin to add comments/replies
router.post("/:id/comment", userOrAdminProtect, addComment);

// Edit and delete comment endpoints (user or admin authenticated via cookie)
router.put("/:id/comment", userOrAdminProtect, editComment);
router.delete("/:id/comment", userOrAdminProtect, deleteComment);

// Accept POST for delete to support clients that can't send a request body with DELETE
router.post("/:id/comment/delete", userOrAdminProtect, deleteComment);

// Admin route to update status
router.put("/:id/status", protectAdminRoute, updateComplaintStatus);

export default router;