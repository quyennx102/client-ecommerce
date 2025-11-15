import axiosInstance from '../utils/axios';

const storeService = {
  // Get all stores
  getStores: async (params = {}) => {
    const response = await axiosInstance.get('/stores', { params });
    return response.data;
  },

  // Get store by ID
  getStoreById: async (id, params = {}) => {
    const response = await axiosInstance.get(`/stores/detail/${id}`, { params });
    return response.data;
  },

  // Get my stores (seller)
  getMyStores: async () => {
    const response = await axiosInstance.get('/stores/my/stores');
    return response.data;
  },

  // Create store
  createStore: async (formData) => {
    const response = await axiosInstance.post('/stores', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update store
  updateStore: async (id, formData) => {
    const response = await axiosInstance.put(`/stores/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get store products
  getStoreProducts: async (id, params = {}) => {
    const response = await axiosInstance.get(`/stores/${id}/products`, { params });
    return response.data;
  },

  // Get store statistics
  getStoreStats: async (id, period = 30) => {
    const response = await axiosInstance.get(`/stores/${id}/stats?period=${period}`);
    return response.data;
  },

  // Get top stores
  getTopStores: async (type = 'sales', limit = 10, period = 30) => {
    const response = await axiosInstance.get('/stores/top', {
      params: { type, limit, period }
    });
    return response.data;
  },

  // Get store leaderboard
  getStoreLeaderboard: async (limit = 20, period = 30) => {
    const response = await axiosInstance.get('/stores/leaderboard', {
      params: { limit, period }
    });
    return response.data;
  },

  // Get trending stores
  getTrendingStores: async (limit = 10, days = 7) => {
    const response = await axiosInstance.get('/stores/trending', {
      params: { limit, days }
    });
    return response.data;
  },

  // Get recommended stores
  getRecommendedStores: async (userId = null, limit = 10) => {
    const params = { limit };
    if (userId) params.user_id = userId;

    const response = await axiosInstance.get('/stores/recommended', { params });
    return response.data;
  },

  // Search stores
  searchStores: async (query, page = 1, limit = 20) => {
    const response = await axiosInstance.get('/stores/search', {
      params: { q: query, page, limit }
    });
    return response.data;
  },
  // Get products by store ID
  getStoreProducts: async (storeId, params = {}) => {
    const response = await axiosInstance.get(`/stores/${storeId}/products`, { params });
    return response.data;
  },
  // Admin: Get all stores
  getAllStoresForAdmin: async (params = {}) => {
    const response = await axiosInstance.get('/stores/admin/all', { params });
    return response.data;
  },

  // Admin: Approve or suspend store
  approveStore: async (id, status, reason = null) => {
    const response = await axiosInstance.put(`/stores/${id}/approve`, {
      status,
      reason
    });
    return response.data;
  },
};

export default storeService;