import axiosInstance from '../utils/axios';

const reviewService = {
  /**
   * Get product reviews
   */
  getProductReviews: async (productId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/reviews/product/${productId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Get product reviews error:', error);
      throw error;
    }
  },

  /**
   * Create review
   */
  createReview: async (reviewData) => {
    try {
      const formData = new FormData();

      // Add text fields
      formData.append('product_id', reviewData.product_id);
      formData.append('order_id', reviewData.order_id);
      formData.append('rating', reviewData.rating);
      if (reviewData.comment) {
        formData.append('comment', reviewData.comment);
      }

      // Add images if any
      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await axiosInstance.post('/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Create review error:', error);
      throw error;
    }
  },

  /**
   * Update review
   */
  updateReview: async (reviewId, reviewData) => {
    try {
      const formData = new FormData();

      if (reviewData.rating) {
        formData.append('rating', reviewData.rating);
      }
      if (reviewData.comment !== undefined) {
        formData.append('comment', reviewData.comment);
      }

      // Add new images if any
      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await axiosInstance.put(`/reviews/${reviewId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update review error:', error);
      throw error;
    }
  },

  /**
   * Delete review
   */
  deleteReview: async (reviewId) => {
    try {
      const response = await axiosInstance.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Delete review error:', error);
      throw error;
    }
  },

  /**
   * Get my reviews
   */
  getMyReviews: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/reviews/my-reviews', { params });
      return response.data;
    } catch (error) {
      console.error('Get my reviews error:', error);
      throw error;
    }
  },

  /**
   * Get reviewable products
   */
  getReviewableProducts: async () => {
    try {
      const response = await axiosInstance.get('/reviews/reviewable');
      return response.data;
    } catch (error) {
      console.error('Get reviewable products error:', error);
      throw error;
    }
  },

  /**
   * Check if can review product
   */
  canReviewProduct: async (productId, orderId) => {
    try {
      const response = await axiosInstance.get(`/reviews/can-review/${productId}/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Can review product error:', error);
      throw error;
    }
  },

  /**
   * Toggle like/unlike review
   */
  toggleReviewLike: async (reviewId) => {
    try {
      const response = await axiosInstance.post(`/reviews/${reviewId}/like`);
      return response.data;
    } catch (error) {
      console.error('Toggle review like error:', error);
      throw error;
    }
  },

  /**
   * Get users who liked a review
   */
  getReviewLikes: async (reviewId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/reviews/${reviewId}/likes`, { params });
      return response.data;
    } catch (error) {
      console.error('Get review likes error:', error);
      throw error;
    }
  }
};

export default reviewService;