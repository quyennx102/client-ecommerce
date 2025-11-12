import axiosInstance from '../utils/axios';

/**
 * Lấy token từ localStorage và trả về header
 * (Hoặc bạn có thể giả định 'api' đã tự động đính kèm token)
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const discountService = {
  // ==================
  // ==== SELLER ====
  // ==================

  /**
   * (Seller) Tạo mã giảm giá mới
   */
  createDiscountCode: (storeId, data) => {
    // Thêm store_id vào data
    const payload = { ...data, store_id: storeId };
    return axiosInstance.post('/discounts', payload, getAuthHeader());
  },

  /**
   * (Seller) Lấy tất cả mã của một store
   */
  getMyStoreCodes: (storeId) => {
    return axiosInstance.get(`/discounts/my-codes/${storeId}`, getAuthHeader());
  },

  /**
   * (Seller) Xóa mã giảm giá (pending/rejected)
   */
  deleteMyCode: (discountId) => {
    return axiosInstance.delete(`/discounts/${discountId}`, getAuthHeader());
  },

  // ==================
  // ==== ADMIN ====
  // ==================

  /**
   * (Admin) Lấy các mã chờ duyệt
   */
  getPendingCodes: () => {
    return axiosInstance.get('/discounts/admin/pending', getAuthHeader());
  },

  /**
   * (Admin) Duyệt hoặc từ chối mã
   */
  reviewDiscountCode: (discountId, status) => {
    // status là 'approved' hoặc 'rejected'
    return axiosInstance.patch(`/discounts/admin/${discountId}/review`, { status }, getAuthHeader());
  },
  
  // ==================
  // ==== USER ====
  // ==================

  /**
   * (User) Lấy các mã public của store
   */
  getPublicCodesForStore: (storeId) => {
    return axiosInstance.get(`/discounts/store/${storeId}`);
  },

  /**
   * (User) Xác thực mã
   */
  validateDiscountCode: (data) => {
    // data = { code, store_id, order_total }
    return axiosInstance.post('/discounts/validate', data, getAuthHeader());
  }
};

export default discountService;