import axiosInstance from '../utils/axios';

const productService = {
  // Get all products
  getProducts: async (params = {}) => {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  },

  // Get filter options (NEW)
  getFilterOptions: async () => {
    const response = await axiosInstance.get('/products/filter-options');
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await axiosInstance.get(`/products/detail/${id}`);
    return response.data;
  },

  // Create product
  createProduct: async (formData) => {
    const response = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update product
  updateProduct: async (id, formData) => {
    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },

  getTopSellingProducts: async () => {
    const response = await axiosInstance.get('/products/top-selling');
    return response.data;
  },

  getPopularProducts: async () => {
    const response = await axiosInstance.get('/products/popular');
    return response.data;
  },

  getTrendingProducts: async () => {
    const response = await axiosInstance.get('/products/trending');
    return response.data;
  },

  getDealProducts: async () => {
    const response = await axiosInstance.get('/products/deals');
    return response.data;
  },
};

export default productService;