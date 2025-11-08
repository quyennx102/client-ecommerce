import axiosInstance from '../utils/axios';

const storeService = {
  // Get all stores
  getStores: async (params = {}) => {
    const response = await axiosInstance.get('/stores', { params });
    return response.data;
  },

  // Get store by ID
  getStoreById: async (id, params = {}) => {
    const response = await axiosInstance.get(`/stores/${id}`, { params });
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
  }
};

export default storeService;