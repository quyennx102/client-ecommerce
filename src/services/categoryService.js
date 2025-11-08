import axiosInstance from '../utils/axios';

const categoryService = {
  getCategories: async (params = {}) => {
    const response = await axiosInstance.get('/categories', { params });
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;