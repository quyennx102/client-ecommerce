import axiosInstance from '../utils/axios';

const reviewService = {
  // Lấy reviews của sản phẩm
  getProductReviews: async (productId) => {
    const response = await axiosInstance.get(`reviews/product/${productId}`);
    return response.data;
  },

  // Tạo review mới
  createReview: async (productId, data) => {
    const response = await axiosInstance.post(`/products/${productId}/reviews`, data);
    return response.data;
  },

  // Like một review
  likeReview: async (reviewId) => {
    const response = await axiosInstance.post(`/reviews/${reviewId}/like`);
    return response.data;
  }
};

export default reviewService;