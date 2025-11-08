import axiosInstance from '../utils/axios';

const userService = {
  // =============================================
  // PROFILE MANAGEMENT
  // =============================================

  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await axiosInstance.get('/user/view');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    const response = await axiosInstance.patch('/user/edit', profileData);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (passwordData) => {
    const response = await axiosInstance.patch('/user/password', passwordData);
    return response.data;
  },

  /**
   * Upload profile image
   */
  uploadImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await axiosInstance.patch('/user/updateImage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // =============================================
  // CART MANAGEMENT
  // =============================================

  /**
   * Get user cart
   */
  getCart: async () => {
    const response = await axiosInstance.get('/user/cart');
    return response.data;
  },

  /**
   * Add product to cart
   */
  addToCart: async (productId) => {
    const response = await axiosInstance.post('/user/cart', { productId });
    return response.data;
  },

  /**
   * Remove product from cart
   */
  removeFromCart: async (productId, type = 'single') => {
    const response = await axiosInstance.post('/user/cart/delete', { 
      productId, 
      type: type === 'all' ? 'removeAll' : 'single' 
    });
    return response.data;
  },

  /**
   * Get cart size (number of unique products)
   */
  getCartSize: async () => {
    const response = await axiosInstance.get('/user/cart/size');
    return response.data;
  },

  /**
   * Clear entire cart (remove all items)
   */
  clearCart: async () => {
    // Implementation depends on your backend
    // This is a custom implementation - you might need to adjust based on your API
    try {
      const cartResponse = await axiosInstance.get('/user/cart');
      const cartItems = cartResponse.data.data;
      
      // Remove all items one by one
      const removePromises = cartItems.map(item => 
        axiosInstance.post('/user/cart/delete', { 
          productId: item._id, 
          type: 'removeAll' 
        })
      );
      
      await Promise.all(removePromises);
      return { success: true, message: 'Cart cleared successfully' };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to clear cart');
    }
  },

  /**
   * Update product quantity in cart
   */
  updateCartQuantity: async (productId, newQuantity) => {
    // Since your current API doesn't have direct quantity update,
    // we'll implement it by removing and adding items
    try {
      // First get current cart to find current quantity
      const cartResponse = await axiosInstance.get('/user/cart');
      const cartItems = cartResponse.data.data;
      const currentItem = cartItems.find(item => item._id === productId);
      
      if (!currentItem) {
        throw new Error('Product not found in cart');
      }

      const currentQuantity = currentItem.count;
      const difference = newQuantity - currentQuantity;

      if (difference > 0) {
        // Need to add more items
        for (let i = 0; i < difference; i++) {
          await axiosInstance.post('/user/cart', { productId });
        }
      } else if (difference < 0) {
        // Need to remove some items
        for (let i = 0; i < Math.abs(difference); i++) {
          await axiosInstance.post('/user/cart/delete', { productId });
        }
      }

      return { success: true, message: 'Cart quantity updated successfully' };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update cart quantity');
    }
  },

  // =============================================
  // ADMIN FUNCTIONS (if user is admin)
  // =============================================

  /**
   * Get all users (admin only)
   */
  getAllUsers: async () => {
    const response = await axiosInstance.get('/user/all');
    return response.data;
  },

  /**
   * Admin update user
   */
  adminUpdateUser: async (userId, userData) => {
    const response = await axiosInstance.patch('/user/admin/edit', { 
      userId, 
      ...userData 
    });
    return response.data;
  },

  /**
   * Admin upload user image
   */
  adminUploadImage: async (userId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('userId', userId);
    
    const response = await axiosInstance.patch('/user/admin/updateImage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Admin delete user
   */
  adminDeleteUser: async (userId) => {
    const response = await axiosInstance.delete('/user/admin/delete', { 
      data: { userId } 
    });
    return response.data;
  },

  /**
   * Get users charts data (admin only)
   */
  getUsersCharts: async () => {
    const response = await axiosInstance.get('/user/charts');
    return response.data;
  }
};

export default userService;