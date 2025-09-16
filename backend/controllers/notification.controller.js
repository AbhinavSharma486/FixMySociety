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