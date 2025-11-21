import axiosInstance from '../utils/axios';

const orderService = {
  /**
   * Create order from cart
   */
  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  /**
   * Get my orders (customer)
   */
  getMyOrders: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/orders/my-orders', { params });
      return response.data;
    } catch (error) {
      console.error('Get my orders error:', error);
      throw error;
    }
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Get order by ID error:', error);
      throw error;
    }
  },

  /**
   * Cancel order
   */
  cancelOrder: async (orderId, data = {}) => {
    try {
      const response = await axiosInstance.put(`/orders/${orderId}/cancel`, data);
      return response.data;
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  },

  /**
   * Update order status (Seller/Admin)
   */
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

  /**
   * Get seller orders
   */
  getSellerOrders: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/orders/seller/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Get seller orders error:', error);
      throw error;
    }
  },

  /**
   * Get order statistics
   */
  getOrderStats: async () => {
    try {
      const response = await axiosInstance.get('/orders/stats');
      return response.data;
    } catch (error) {
      console.error('Get order stats error:', error);
      throw error;
    }
  },

  /**
   * Track order (get tracking information)
   */
  trackOrder: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}/track`);
      return response.data;
    } catch (error) {
      console.error('Track order error:', error);
      throw error;
    }
  },

  /**
   * Request return/refund
   */
  requestReturn: async (orderId, returnData) => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/return`, returnData);
      return response.data;
    } catch (error) {
      console.error('Request return error:', error);
      throw error;
    }
  },

  /**
   * Get order invoice
   */
  downloadInvoice: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      console.error('Download invoice error:', error);
      throw error;
    }
  }
};

export default orderService;