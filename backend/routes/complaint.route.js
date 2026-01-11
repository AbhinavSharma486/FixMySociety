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

// Multer upload middleware for complaint files (images and video)
const uploadComplaintFiles = (req, res, next) => {
  // Use the multer instance attached to req in index.js
  const upload = req.upload.fields([
    { name: 'images', maxCount: 8 }, // Allow up to 8 images
    { name: 'video', maxCount: 1 }   // Allow 1 video
  ]);

  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum 10MB per file allowed.'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 8 images and 1 video allowed.'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
};

// User complaint routes
// Support both RESTful and explicit paths expected by frontend
router.post("/", userprotectRoute, uploadComplaintFiles, createComplaint);
router.post("/create", userprotectRoute, uploadComplaintFiles, createComplaint);
router.get("/", userprotectRoute, getAllComplaints);
router.get("/all", userprotectRoute, getAllComplaints);
router.get("/:id", userprotectRoute, getComplaintById);
router.put("/:id", userprotectRoute, uploadComplaintFiles, updateComplaint);
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