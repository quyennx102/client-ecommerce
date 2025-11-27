import axiosInstance from '../utils/axios';

const userService = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  /**
   * Upload avatar image
   */
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axiosInstance.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  },

  /**
   * Delete avatar
   */
  deleteAvatar: async () => {
    try {
      const response = await axiosInstance.delete('/users/avatar');
      return response.data;
    } catch (error) {
      console.error('Delete avatar error:', error);
      throw error;
    }
  },

  /**
   * Change password
   */
  changePassword: async (passwordData) => {
    try {
      const response = await axiosInstance.post('/users/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  /**
   * Get user statistics
   */
  getUserStats: async () => {
    try {
      const response = await axiosInstance.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }
};

export default userService;