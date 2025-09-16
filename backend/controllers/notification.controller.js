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