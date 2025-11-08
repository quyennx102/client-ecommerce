import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Cấu hình mặc định
const defaultConfig = {
  customClass: {
    confirmButton: 'btn btn-main',
    cancelButton: 'btn btn-outline-secondary'
  },
  buttonsStyling: false,
  showClass: {
    popup: 'animate__animated animate__fadeIn animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOut animate__faster'
  }
};

// SweetAlert utility
export const sweetAlert = {
  // Xác nhận xóa item
  confirmDelete: (itemName = 'item', options = {}) => {
    return MySwal.fire({
      title: 'Are you sure?',
      html: `<strong>"${itemName}"</strong> will be deleted permanently. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      reverseButtons: true,
    //   ...defaultConfig,
      ...options
    });
  },

  // Xác nhận xóa nhiều items
  confirmBulkDelete: (count = 0, options = {}) => {
    return MySwal.fire({
      title: 'Are you sure?',
      html: `<strong>${count} items</strong> will be deleted permanently. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, delete ${count} items!`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      reverseButtons: true,
    //   ...defaultConfig,
      ...options
    });
  },

  // Xác nhận hành động chung
  confirmAction: (title, text, confirmText = 'Confirm', options = {}) => {
    return MySwal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      ...defaultConfig,
      ...options
    });
  },

  // Thông báo thành công
  success: (title, text, options = {}) => {
    return MySwal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'OK',
      ...defaultConfig,
      ...options
    });
  },

  // Thông báo lỗi
  error: (title, text, options = {}) => {
    return MySwal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'OK',
      ...defaultConfig,
      ...options
    });
  },

  // Thông báo cảnh báo
  warning: (title, text, options = {}) => {
    return MySwal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'OK',
      ...defaultConfig,
      ...options
    });
  },

  // Thông báo thông tin
  info: (title, text, options = {}) => {
    return MySwal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonText: 'OK',
      ...defaultConfig,
      ...options
    });
  }
};

// Export mặc định
export default sweetAlert;