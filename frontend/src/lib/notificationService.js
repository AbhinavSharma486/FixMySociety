import { axiosInstance as axios } from './axios';

// Get user notifications
export const getUserNotifications = async (params = {}) => {
  try {
    const response = await axios.get('/api/notifications/user', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch notifications' };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark notification as read' };
  }
};

// Mark notification as unread
export const markNotificationAsUnread = async (notificationId) => {
  try {
    const response = await axios.put(`/api/notifications/${notificationId}/unread`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark notification as unread' };
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.put('/api/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark all notifications as read' };
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete notification' };
  }
};

// Get notification statistics
export const getNotificationStats = async () => {
  try {
    const response = await axios.get('/api/notifications/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch notification stats' };
  }
};

// Create notification (for testing purposes)
export const createNotification = async (notificationData) => {
  try {
    const response = await axios.post('/api/notifications/create', notificationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create notification' };
  }
};