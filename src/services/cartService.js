import axiosInstance from '../utils/axios';

const cartService = {
  // Get cart
  getCart: async () => {
    const response = await axiosInstance.get('/carts');
    return response.data;
  },

  // Add to cart
  addToCart: async (data) => {
    const response = await axiosInstance.post('/carts/add', data);
    return response.data;
  },

  // Update cart item
  updateCartItem: async (id, quantity) => {
    const response = await axiosInstance.put(`/carts/${id}`, { quantity });
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (id) => {
    const response = await axiosInstance.delete(`/carts/${id}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await axiosInstance.delete('/carts');
    return response.data;
  },

  //Get Cart Size
  getCartSize: async () => {
    const response = await axiosInstance.get('/carts/size');
    return response.data;
  },
  // Validate discount code
  validateDiscountCode: async (code, storeId, orderTotal) => {
    const response = await axiosInstance.post('/discounts/validate', {
      code,
      store_id: storeId,
      order_total: orderTotal
    });
    return response.data;
  }
};

export default cartService;