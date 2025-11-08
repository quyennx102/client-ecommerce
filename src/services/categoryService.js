import axiosInstance from '../utils/axios';

// const categoryService = {
//   getCategories: async (params = {}) => {
//     const response = await axiosInstance.get('/categories', { params });
//     return response.data;
//   },

//   getCategoryById: async (id) => {
//     const response = await axiosInstance.get(`/categories/${id}`);
//     return response.data;
//   }
// };

const categoryService = {
  getCategories: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance(`/categories?${queryString}`);
    return response.data;
  },

  getCategoryById: async (id, includeProducts = false) => {
    const response = await axiosInstance(
      `/categories/${id}?include_products=${includeProducts}`
    );
     return response.data;
  },

  createCategory: async (data) => {
    const response = await axiosInstance(`/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await axiosInstance(`/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.data;
  },

  deleteCategory: async (id, force = false) => {
    const response = await axiosInstance(
      `/categories/${id}?force=${force}`,
      { method: 'DELETE' }
    );
    return response.data;
  },

  reorderCategories: async (categories) => {
    const response = await axiosInstance(`/categories/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories })
    });
    return response.data;
  },

  getCategoryProducts: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance(
      `/categories/${id}/products?${queryString}`
    );
    return response.data;
  },

  getCategoryStats: async (id) => {
    const response = await axiosInstance(`/categories/${id}/stats`);
    return response.data;
  },

  // Products
  getProductById: async (id) => {
    const response = await axiosInstance(`/products/${id}`);
    return response.data;
  },

  getProductReviews: async (productId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance(
      `/products/${productId}/reviews?${queryString}`
    );
   return response.data;
  }
};

export default categoryService;