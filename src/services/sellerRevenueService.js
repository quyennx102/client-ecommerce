import axiosInstance from '../utils/axios';

const sellerRevenueService = {
  /**
   * Get seller revenue statistics
   */
  getRevenue: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/seller/revenue', { params });
      return response.data;
    } catch (error) {
      console.error('Get revenue error:', error);
      throw error;
    }
  },

  /**
   * Get detailed store revenue
   */
  getStoreRevenue: async (storeId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/seller/revenue/store/${storeId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Get store revenue error:', error);
      throw error;
    }
  },

  /**
   * Export revenue report
   */
  exportReport: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/seller/revenue/export', { params });
      return response.data;
    } catch (error) {
      console.error('Export report error:', error);
      throw error;
    }
  }
};

export default sellerRevenueService;