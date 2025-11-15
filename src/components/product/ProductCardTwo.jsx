import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Danh sách các badge có thể có
const badges = [
  { text: 'New', class: 'bg-warning-600' }, // Lớp CSS bạn cung cấp
  { text: 'Deal', class: 'bg-danger-600' },
  { text: 'Hot', class: 'bg-main-600' },
  { text: 'Sale', class: 'bg-success-600' },
  { text: 'Sold', class: 'bg-tertiary-600' },
  { text: 'Best Seller', class: 'bg-info-600' },
];

// Hàm lấy 1 badge ngẫu nhiên
const getRandomBadge = () => badges[Math.floor(Math.random() * badges.length)];

/**
 * Lấy ảnh bìa (is_primary) từ mảng images,
 * nếu không có, lấy ảnh đầu tiên,
 * nếu không có, trả về ảnh placeholder.
 */
const getPrimaryImage = (images) => {
  if (!images || images.length === 0) {
    return '/images/placeholder.jpg'; // Cung cấp một ảnh mặc định
  }
  const primary = images.find(img => img.is_primary);
  return primary ? primary.image_url : images[0].image_url;
};

/**
 * Component ProductCard này sử dụng
 * cấu trúc HTML bạn cung cấp.
 */
const ProductCardTwo = ({ product }) => {
  // --- State cho badge ngẫu nhiên ---
  const [badge, setBadge] = useState(null);

  useEffect(() => {
    // Chỉ đặt badge ngẫu nhiên MỘT LẦN khi card được render
    if (Math.random() > 0.3) {
      setBadge(getRandomBadge());
    }
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  if (!product) return null;

  // --- 1. Tính toán các giá trị động ---

  // Link
  const productUrl = `/products/${product.product_id}`;

  // Ảnh
  const imageUrl = getPrimaryImage(product.images);

  // Rating (chỉ hiển thị nếu API trả về)
  const hasRating = product.average_rating && parseFloat(product.average_rating) >= 0;
  const rating = hasRating ? parseFloat(product.average_rating).toFixed(1) : null;
  // GHI CHÚ: API của bạn chưa trả về số lượng review (17k), nên tôi sẽ ẩn phần đó đi.

  // Store
  const storeName = product.store?.store_name || 'Store';

  // Progress Bar (Tính % đã bán)
  const totalStock = product.sold_quantity + product.stock_quantity;
  const hasStockProgress = totalStock > 0;
  const soldPercentage = hasStockProgress ? (product.sold_quantity / totalStock) * 100 : 0;

  // Giá
  const price = parseFloat(product.price).toFixed(2);
  // GHI CHÚ: API của bạn chưa có "giá cũ" (28.99), nên tôi sẽ ẩn đi.
  // Bạn có thể thêm trường `old_price` vào model Product nếu muốn.

  // Badge (Hiển thị "Out of Stock" nếu hết hàng)
  const isOutOfStock = product.stock_quantity === 0;

  // 1. Lấy ngày hôm nay
  const deliveryDate = new Date(); 
  // 2. Set ngày thành +3 ngày
  deliveryDate.setDate(deliveryDate.getDate() + 3); 
  // 3. Format thành dạng "Tháng Ngày" (ví dụ: "Nov 18")
  const deliveryDateText = deliveryDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit' 
  });

  return (
    <div className="col-xxl-2 col-xl-3 col-lg-4 col-sm-6">
      <div className="product-card h-100 p-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">

        {/* 1. Ảnh và Badge */}
        <Link
          to={productUrl}
          className="product-card__thumb flex-center rounded-8 bg-gray-50 position-relative"
          style={{ minHeight: '220px' }}
        >
          {/* LOGIC BADGE (Kết hợp) */}
          {/* Ưu tiên "Hết hàng" */}
          {isOutOfStock && (
            <span className="product-card__badge bg-danger px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0">
              Out of Stock
            </span>
          )}

          {/* Hiển thị badge ngẫu nhiên (Logic cũ) NẾU CÒN HÀNG */}
          {badge && !isOutOfStock && (
            <span
              className={`product-card__badge ${badge.class} px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0`}
            >
              {badge.text}
            </span>
          )}

          <img
            src={`${process.env.REACT_APP_IMAGE_URL}${imageUrl}`}
            alt={product.product_name}
            className="w-auto max-w-unset"
            style={{ maxHeight: '200px', objectFit: 'contain' }}
          />
        </Link>

        {/* 2. Nội dung card */}
        <div className="product-card__content mt-16">

          {/* Discount Badge (% OFF) (Logic mới) */}
          {/* {hasDiscount && (
            <span className="text-success-600 bg-success-50 text-sm fw-medium py-4 px-8">
              {discountPercent}% OFF
            </span>
          )} */}

          {/* Tên sản phẩm (Logic cũ) */}
          <h6 className="title text-lg fw-semibold my-16">
            <Link
              to={productUrl}
              className="link text-line-2"
              tabIndex={0}
            >
              {product.product_name}
            </Link>
          </h6>

          {/* Rating (Logic cũ) */}
          {hasRating && (
            <div className="flex-align gap-6">
              <div className="flex-align gap-8">
                {/* 5 sao tĩnh - theo template */}
                <span className="text-15 fw-medium text-warning-600 d-flex"><i className="ph-fill ph-star" /></span>
                <span className="text-15 fw-medium text-warning-600 d-flex"><i className="ph-fill ph-star" /></span>
                <span className="text-15 fw-medium text-warning-600 d-flex"><i className="ph-fill ph-star" /></span>
                <span className="text-15 fw-medium text-warning-600 d-flex"><i className="ph-fill ph-star" /></span>
                <span className="text-15 fw-medium text-warning-600 d-flex"><i className="ph-fill ph-star" /></span>
              </div>
              <span className="text-xs fw-medium text-gray-500">{rating}</span>
              {/* <span className="text-xs fw-medium text-gray-500">(12K)</span> */}
            </div>
          )}

          {/* Fulfilled By (Text tĩnh từ HTML mới) */}
          <span className="py-2 px-8 text-xs rounded-pill text-main-two-600 bg-main-two-50 mt-16">
            Fulfilled by {storeName}
          </span>

          {/* Giá (Logic cũ + HTML mới) */}
          <div className="product-card__price mt-16 mb-30">
            {/* Giá cũ */}
            {/* {hasDiscount && (
              <span className="text-gray-400 text-md fw-semibold text-decoration-line-through">
                ${oldPrice}
              </span>
            )} */}
            {/* Giá mới */}
            <span className="text-heading text-md fw-semibold ">
              ${price}{" "}
              <span className="text-gray-500 fw-normal">/Qty</span>{" "}
            </span>
          </div>

          {/* Delivery Date (Text tĩnh từ HTML mới) */}
          <span className="text-neutral-600">
            Delivered by <span className="text-main-600">{deliveryDateText}</span>
          </span>

          {/* HTML này không có nút bấm */}
        </div>
      </div>
    </div>
  );
};

export default ProductCardTwo;