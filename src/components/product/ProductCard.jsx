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
const ProductCard = ({ product }) => {
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
  const hasRating = product.average_rating && parseFloat(product.average_rating) > 0;
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

  return (
    // <div className="product-card h-100 p-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
    //   <Link
    //     to={productUrl}
    //     className="product-card__thumb flex-center rounded-8 bg-gray-50 position-relative"
    //     // Thêm style để đảm bảo ảnh đồng đều
    //     style={{ minHeight: '220px' }}
    //   >
    //     {isOutOfStock && (
    //       <span className="product-card__badge bg-danger px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0">
    //         Best seller
    //       </span>
    //     )}

    //     <img
    //       src={`${process.env.REACT_APP_IMAGE_URL}${imageUrl}`}
    //       alt={product.product_name}
    //       // Thêm style để ảnh vừa vặn
    //       style={{ maxHeight: '200px', width: 'auto', objectFit: 'contain' }}
    //     />
    //   </Link>
    //   <div className="product-card__content mt-16">

    //     {/* Rating: Chỉ hiển thị nếu có */}
    //     {hasRating && (
    //       <div className="flex-align gap-6">
    //         <span className="text-xs fw-medium text-gray-500">{rating}</span>
    //         <span className="text-15 fw-medium text-warning-600 d-flex">
    //           <i className="ph-fill ph-star" />
    //         </span>
    //         {/* <span className="text-xs fw-medium text-gray-500">
    //           (17k) // Đã ẩn vì API chưa có
    //         </span> 
    //         */}
    //       </div>
    //     )}

    //     {/* Tên sản phẩm */}
    //     <h6 className="title text-lg fw-semibold mt-12 mb-8">
    //       <Link
    //         to={productUrl}
    //         className="link text-line-2"
    //         tabIndex={0}
    //       >
    //         {product.product_name}
    //       </Link>
    //     </h6>

    //     {/* Tên cửa hàng */}
    //     <div className="flex-align gap-4">
    //       <span className="text-tertiary-600 text-md d-flex">
    //         <i className="ph-fill ph-storefront" />
    //       </span>
    //       <span className="text-gray-500 text-xs">
    //         By {storeName}
    //       </span>
    //     </div>

    //     {/* Progress Bar: Chỉ hiển thị nếu có hàng */}
    //     {hasStockProgress && (
    //       <div className="mt-8">
    //         <div
    //           className="progress w-100 bg-color-three rounded-pill h-4"
    //           role="progressbar"
    //           aria-label="Stock progress"
    //           aria-valuenow={soldPercentage}
    //           aria-valuemin={0}
    //           aria-valuemax={100}
    //         >
    //           <div
    //             className="progress-bar bg-tertiary-600 rounded-pill"
    //             style={{ width: `${soldPercentage}%` }}
    //           />
    //         </div>
    //         <span className="text-gray-900 text-xs fw-medium mt-8">
    //           Sold: {product.sold_quantity}/{totalStock}
    //         </span>
    //       </div>
    //     )}

    //     {/* Giá */}
    //     <div className="product-card__price my-20">
    //       {/* <span className="text-gray-400 text-md fw-semibold text-decoration-line-through">
    //         $28.99 // Đã ẩn vì API chưa có
    //       </span> 
    //       */}
    //       <span className="text-heading text-md fw-semibold ">
    //         ${price}{" "}
    //         <span className="text-gray-500 fw-normal">/Qty</span>{" "}
    //       </span>
    //     </div>

    //     {/* Nút Bấm */}
    //     <Link
    //       to="/cart"
    //       className="product-card__cart btn bg-gray-50 text-heading hover-bg-main-600 hover-text-white py-11 px-24 rounded-8 flex-center gap-8 fw-medium"
    //       tabIndex={0}
    //     >
    //       Add To Cart <i className="ph ph-shopping-cart" />
    //     </Link>
    //   </div>
    // </div>
    <div>
      <div className="product-card h-100 p-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
        <Link
          to={productUrl}
          className="product-card__thumb flex-center rounded-8 bg-gray-50 position-relative"
        >
          {/* === SỬA ĐỔI BADGE === */}
          {/* Hiển thị badge ngẫu nhiên NẾU CÓ */}
          {badge && !isOutOfStock && (
            <span
              className={`product-card__badge ${badge.class} px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0`}
            >
              {badge.text}
            </span>
          )}
          {/* Ưu tiên hiển thị "Hết hàng" nếu hết hàng */}
          {isOutOfStock && (
            <span className="product-card__badge bg-danger px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0">
              Out of Stock
            </span>
          )}
          {/* <span className="product-card__badge bg-main-600 px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0">
            Sold
          </span> */}
          <img
            src={`${process.env.REACT_APP_IMAGE_URL}${imageUrl}`}
            alt=""
            className="w-auto max-w-unset"
            style={{ maxHeight: '200px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>
        <div className="product-card__content mt-16">
          <div className="flex-align gap-6">
            <span className="text-xs fw-medium text-gray-500">{product.average_rating}</span>
            <span className="text-15 fw-medium text-warning-600 d-flex">
              <i className="ph-fill ph-star" />
            </span>
            <span className="text-15 fw-medium text-warning-600 d-flex">
              <i className="ph-fill ph-star" />
            </span>
            <span className="text-15 fw-medium text-warning-600 d-flex">
              <i className="ph-fill ph-star" />
            </span>
            <span className="text-15 fw-medium text-warning-600 d-flex">
              <i className="ph-fill ph-star" />
            </span>
            <span className="text-15 fw-medium text-warning-600 d-flex">
              <i className="ph-fill ph-star" />
            </span>
            <span className="text-xs fw-medium text-gray-500">
              ({product.review_count})
            </span>
          </div>
          <h6 className="title text-lg fw-semibold mt-12 mb-8">
            <Link
              to={`/products/${product.product_id}`}
              className="link text-line-2"
              tabIndex={0}
            >
              {product.product_name}
            </Link>
          </h6>
          <div className="flex-align gap-4">
            <span className="text-main-600 text-md d-flex">
              <i className="ph-fill ph-storefront" />
            </span>
            <span className="text-gray-500 text-xs">
              By {storeName}
            </span>
          </div>
          <div className="mt-8">
            <div
              className="progress w-100 bg-color-three rounded-pill h-4"
              role="progressbar"
              aria-label="Basic example"
              aria-valuenow={35}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-bar bg-tertiary-600 rounded-pill"
                style={{ width: "35%" }}
              />
            </div>
            <span className="text-gray-900 text-xs fw-medium mt-8">
              Sold: {product.sold_quantity}/{totalStock}
            </span>
          </div>
          <div className="product-card__price my-20">
            {/* <span className="text-gray-400 text-md fw-semibold text-decoration-line-through">
              $28.99
            </span> */}
            <span className="text-heading text-md fw-semibold ">
              ${price}{" "}
              <span className="text-gray-500 fw-normal">/Qty</span>{" "}
            </span>
          </div>
          <Link
            to="/cart"
            className="product-card__cart btn bg-gray-50 text-heading hover-bg-main-600 hover-text-white py-11 px-24 rounded-8 flex-center gap-8 fw-medium"
            tabIndex={0}
          >
            Add To Cart <i className="ph ph-shopping-cart" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;