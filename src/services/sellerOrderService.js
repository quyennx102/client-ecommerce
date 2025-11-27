import axiosInstance from '../utils/axios';

const sellerOrderService = {
  // Get all seller's orders from all stores
  getSellerOrders: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/orders/seller/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Get seller orders error:', error);
      throw error;
    }
  },

  // Get orders for specific store
  getStoreOrders: async (storeId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/orders/seller/orders`, {
        params: { ...params, store_id: storeId }
      });
      return response.data;
    } catch (error) {
      console.error('Get store orders error:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axiosInstance.put(`/orders/${orderId}/status`, {
        order_status: status
      });
      return response.data;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  },

  // Update payment status (NEW)
  updatePaymentStatus: async (orderId, paymentStatus) => {
    try {
      const response = await axiosInstance.put(`/orders/${orderId}/payment-status`, {
        payment_status: paymentStatus
      });
      return response.data;
    } catch (error) {
      console.error('Update payment status error:', error);
      throw error;
    }
  },

  // Get order details
  getOrderDetails: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Get order details error:', error);
      throw error;
    }
  },

  // Get seller's stores for filter
  getSellerStores: async () => {
    try {
      const response = await axiosInstance.get('/stores/my/stores');
      return response.data;
    } catch (error) {
      console.error('Get seller stores error:', error);
      throw error;
    }
  },

  // Get order statistics
  getOrderStats: async (storeId = null) => {
    try {
      const params = storeId ? { store_id: storeId } : {};
      const response = await axiosInstance.get('/orders/seller/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Get order stats error:', error);
      throw error;
    }
  }
};

export default sellerOrderService;