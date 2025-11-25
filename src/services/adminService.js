import axiosInstance from '../utils/axios';

const adminService = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/admin/dashboard', { params });
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  /**
   * Get all users
   */
  getAllUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  /**
   * Update user status
   */
  updateUserStatus: async (userId, status) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update user status error:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },

  /**
   * Update user role
   */
  updateUserRole: async (userId, role) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },
  approveDiscountCode: async (discountId, status) => {
    try {
      const response = await axiosInstance.put(`/admin/discount-codes/${discountId}/approve`, { status });
      return response.data;
    } catch (error) {
      console.error('Approve discount code error:', error);
      throw error;
    }
  }
};

export default adminService;