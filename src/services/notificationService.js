import axiosInstance from '../utils/axios';

const notificationService = {
  getNotifications: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await axiosInstance.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await axiosInstance.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await axiosInstance.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }
};

export default notificationService;
