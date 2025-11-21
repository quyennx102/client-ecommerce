import axiosInstance from '../utils/axios';

const categoryService = {
  /**
   * Get all categories
   */
  getCategories: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/categories', { params });
      return response.data;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  },

  /**
   * Get category tree (hierarchical structure)
   */
  getCategoryTree: async () => {
    try {
      const response = await axiosInstance.get('/categories', {
        params: { hierarchy: 'true' }
      });
      return response.data;
    } catch (error) {
      console.error('Get category tree error:', error);
      throw error;
    }
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id, includeProducts = false) => {
    try {
      const response = await axiosInstance.get(`/categories/${id}`, {
        params: { include_products: includeProducts }
      });
      return response.data;
    } catch (error) {
      console.error('Get category by ID error:', error);
      throw error;
    }
  },

  /**
   * Create new category with icon upload
   * @param {FormData} formData - FormData object containing category data and icon file
   */
  createCategory: async (formData) => {
    try {
      const response = await axiosInstance.post('/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  },

  /**
   * Update category with optional icon upload
   * @param {number} id - Category ID
   * @param {FormData|Object} data - FormData for icon upload or plain object
   */
  updateCategory: async (id, data) => {
    try {
      const config = {};
      
      // Check if data is FormData (for icon upload)
      if (data instanceof FormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data'
        };
      }

      const response = await axiosInstance.put(`/categories/${id}`, data, config);
      return response.data;
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  },

  /**
   * Delete category
   * @param {number} id - Category ID
   * @param {boolean} force - Force delete and move products to Uncategorized
   */
  deleteCategory: async (id, force = false) => {
    try {
      const response = await axiosInstance.delete(`/categories/${id}`, {
        params: { force }
      });
      return response.data;
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  },

  /**
   * Reorder categories
   * @param {Array} categories - Array of {id, display_order}
   */
  reorderCategories: async (categories) => {
    try {
      const response = await axiosInstance.put('/categories/reorder', { categories });
      return response.data;
    } catch (error) {
      console.error('Reorder categories error:', error);
      throw error;
    }
  },

  /**
   * Get products by category
   */
  getCategoryProducts: async (id, params = {}) => {
    try {
      const response = await axiosInstance.get(`/categories/${id}/products`, { params });
      return response.data;
    } catch (error) {
      console.error('Get category products error:', error);
      throw error;
    }
  },

  /**
   * Get category statistics
   */
  getCategoryStats: async (id) => {
    try {
      const response = await axiosInstance.get(`/categories/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Get category stats error:', error);
      throw error;
    }
  }
};

export default categoryService;