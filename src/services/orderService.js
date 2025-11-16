// services/orderService.js
import axiosInstance from '../utils/axios';

const orderService = {
  // Create order from cart
  createOrder: async (orderData) => {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  },

  // Get my orders
  getMyOrders: async (params = {}) => {
    const response = await axiosInstance.get('/orders/my-orders', { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await axiosInstance.put(`/orders/${orderId}/cancel`, {
      cancelled_reason: reason
    });
    return response.data;
  },

  // Seller: Get orders
  getSellerOrders: async (params = {}) => {
    const response = await axiosInstance.get('/orders/seller/orders', { params });
    return response.data;
  },

  // Seller: Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await axiosInstance.put(`/orders/${orderId}/status`, {
      order_status: status
    });
    return response.data;
  }
};

export default orderService;