// services/paymentService.js
import axiosInstance from '../utils/axios';

const paymentService = {
  // Create MoMo payment
  createMoMoPayment: async (orderId) => {
    const response = await axiosInstance.post('/payments/momo/create', {
      order_id: orderId
    });
    return response.data;
  },

  // Create ZaloPay payment
  createZaloPayPayment: async (orderId) => {
    const response = await axiosInstance.post('/payments/zalopay/create', {
      order_id: orderId
    });
    return response.data;
  },

  // Create ZaloPay payment
  createVnPayPayment: async (orderId) => {
    const response = await axiosInstance.post('/payments/vnpay/create', {
      order_id: orderId
    });
    return response.data;
  },

  // Check payment status
  checkPaymentStatus: async (orderId, paymentMethod) => {
    const response = await axiosInstance.get('/payments/status', {
      params: {
        order_id: orderId,
        payment_method: paymentMethod
      }
    });
    return response.data;
  }
};

export default paymentService;