import axiosInstance from '../utils/axios';

const cartService = {
  // Get cart
  getCart: async () => {
    const response = await axiosInstance.get('/cart');
    return response.data;
  },

  // Add to cart
  addToCart: async (data) => {
    const response = await axiosInstance.post('/cart/add', data);
    return response.data;
  },

  // Update cart item
  updateCartItem: async (id, quantity) => {
    const response = await axiosInstance.put(`/cart/${id}`, { quantity });
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (id) => {
    const response = await axiosInstance.delete(`/cart/${id}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await axiosInstance.delete('/cart');
    return response.data;
  }
};

export default cartService;