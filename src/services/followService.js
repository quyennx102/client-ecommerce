import axiosInstance from '../utils/axios';

const followService = {
  /**
   * Follow a store
   */
  followStore: async (storeId) => {
    try {
      const response = await axiosInstance.post(`/follows/store/${storeId}`);
      return response.data;
    } catch (error) {
      console.error('Follow store error:', error);
      throw error;
    }
  },

  /**
   * Unfollow a store
   */
  unfollowStore: async (storeId) => {
    try {
      const response = await axiosInstance.delete(`/follows/store/${storeId}`);
      return response.data;
    } catch (error) {
      console.error('Unfollow store error:', error);
      throw error;
    }
  },

  /**
   * Check follow status
   */
  checkFollowStatus: async (storeId) => {
    try {
      const response = await axiosInstance.get(`/follows/store/${storeId}/status`);
      return response.data;
    } catch (error) {
      console.error('Check follow status error:', error);
      throw error;
    }
  },

  /**
   * Get my followed stores
   */
  getMyFollowedStores: async () => {
    try {
      const response = await axiosInstance.get('/follows/my-stores');
      return response.data;
    } catch (error) {
      console.error('Get my followed stores error:', error);
      throw error;
    }
  },

  /**
   * Get store followers count
   */
  getStoreFollowersCount: async (storeId) => {
    try {
      const response = await axiosInstance.get(`/follows/store/${storeId}/count`);
      return response.data;
    } catch (error) {
      console.error('Get store followers count error:', error);
      throw error;
    }
  }
};

export default followService;