import express from "express";

import { userprotectRoute } from "../middleware/user.auth.middleware.js";
import {
  deleteNotification,
  getNotificationStats,
  getUserNotifications,
  markNotificationAsRead,
  markNotificationAsUnread
} from "../controllers/notification.controller.js";

const router = express.Router();

// All notificatoin routes are protected 
router.get("/user", userprotectRoute, getUserNotifications);
router.get("/stats", userprotectRoute, getNotificationStats);
router.put("/:notificationId/read", userprotectRoute, markNotificationAsRead);
router.put("/:notificationId/unread", userprotectRoute, markNotificationAsUnread);
router.delete("/:notificationId", userprotectRoute, deleteNotification);

export default router;