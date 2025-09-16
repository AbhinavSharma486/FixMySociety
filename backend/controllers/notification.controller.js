import Notification from "../models/notification.model.js";

// Create Notification 
export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);

    await notification.save();

    return notification;

  } catch (error) {
    console.log("Error in createNotification:", error);
    throw error;
  }
};

// Get User notifications 
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const userId = req.user._id;

    const query = { recipient: userId };

    const notifications = await Notification.find(query)
      .populate('sender', 'fullName avatar')
      .populate('relatedComplaint', 'title')
      .populate('relatedBuilding', 'buildingName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      notifications,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// Mark notification as read 
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or already read."
      });
    }

    // Emit notificationRead event via Socket.io
    req.app.get('socketio').to(userId.toString()).emit("notificationRead", { notificationId: notification._id });

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification
    });
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read."
    });
  }
};

// Mark notification as unread
export const markNotificationAsUnread = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId, isRead: true },
      { $set: { isRead: false, readAt: null } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or already unread."
      });
    }

    // Emit notification Unread event via Socket.io
    req.app.get('socketio').to(userId.toString()).emit("notificationUnread", { notificationId: notification._id });

    res.status(200).json({
      success: false,
      message: "Notification marked as unread.",
      notification
    });
  } catch (error) {
    console.error("Error in markNotificationAsUnread:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as unread."
    });
  }
};

// Delete notification (user local delete only)
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const userId = req.user._id;

    // Find the notification first 
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    // Admins should use the broadcast delete endpoint to perform a global delete
    if (req.admin) {
      return res.status(400).json({
        success: false,
        message: "Admins should delete broadcasts via admin broadcast endpoint."
      });
    }

    // Ensure only the recipient can delete their copy
    if (String(notification.recipient) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this notification"
      });
    }

    await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });

    // Emit notification Deleted event via socket.io to this user only
    req.app.get('socketio').to(userId.toString()).emit("notificationDeleted", { notificationId: notification._id });

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully."
    });
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    res.status(500).json({ success: false, message: "Failed to delete notification." });
  }
};

// Get notification statistics 
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const allCount = await Notification.countDocuments({ recipient: userId });

    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    const readCount = await Notification.countDocuments({ recipient: userId, isRead: true });

    res.status(200).json({
      success: true,
      allCount,
      unreadCount,
      readCount
    });
  } catch (error) {
    console.error("Error in getNotificationStats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notification stats" });
  }
};