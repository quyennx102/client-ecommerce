import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import cartService from '../../services/cartService';
import { useAuth } from '../../contexts/AuthContext';

// Danh sách các badge có thể có
const badges = [
  { text: 'New', class: 'bg-warning-600' },
  { text: 'Deal', class: 'bg-danger-600' },
  { text: 'Hot', class: 'bg-main-600' },
  { text: 'Sale', class: 'bg-success-600' },
  { text: 'Best Seller', class: 'bg-info-600' },
];

/**
 * Lấy ảnh bìa (is_primary) từ mảng images
 */
const getPrimaryImage = (images) => {
  if (!images || images.length === 0) {
    return '/assets/images/thumbs/product-placeholder.png';
  }
  const primary = images.find(img => img.is_primary);
  return primary ? primary.image_url : images[0].image_url;
};

/**
 * Tính badge thông minh dựa trên dữ liệu thật
 */
const getSmartBadge = (product) => {
  // Out of Stock - Priority cao nhất
  if (product.stock_quantity === 0) {
    return { text: 'Out of Stock', class: 'bg-danger-600' };
  }

  // New - Sản phẩm được tạo trong 7 ngày gần đây
  const createdDate = new Date(product.created_at);
  const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= 7) {
    return { text: 'New', class: 'bg-warning-600' };
  }

  // Best Seller - Đã bán nhiều (> 100 hoặc > 50% stock)
  const totalStock = product.sold_quantity + product.stock_quantity;
  const soldPercentage = (product.sold_quantity / totalStock) * 100;
  if (product.sold_quantity > 100 || soldPercentage > 50) {
    return { text: 'Best Seller', class: 'bg-info-600' };
  }

  // Hot - Rating cao (>= 4.5)
  if (product.average_rating >= 4.5) {
    return { text: 'Hot', class: 'bg-main-600' };
  }

  // Sale - Có giá gốc cao hơn giá hiện tại
  if (product.original_price && product.original_price > product.price) {
    const discount = Math.round(((product.original_price - product.price) / product.original_price) * 100);
    if (discount >= 20) {
      return { text: `Sale ${discount}%`, class: 'bg-danger-600' };
    }
  }

  // Low Stock - Sắp hết hàng
  if (product.stock_quantity > 0 && product.stock_quantity <= 10) {
    return { text: 'Low Stock', class: 'bg-warning-600' };
  }

  return null;
};

/**
 * Component ProductCard cải thiện
 */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { fetchCartCount } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [badge, setBadge] = useState(null);

  useEffect(() => {
    // Tính badge thông minh dựa trên dữ liệu
    setBadge(getSmartBadge(product));
  }, [product]);

  if (!product) return null;

  // --- Tính toán các giá trị ---
  const productUrl = `/products/${product.product_id}`;
  const imageUrl = getPrimaryImage(product.images);
  
  // Rating
  const rating = product.average_rating ? parseFloat(product.average_rating).toFixed(1) : '0.0';
  const reviewCount = product.review_count || 0;
  const ratingStars = Math.round(parseFloat(rating));
  
  // Store
  const storeName = product.store?.store_name || 'Unknown Store';
  
  // Stock Progress
  const totalStock = product.sold_quantity + product.stock_quantity;
  const soldPercentage = totalStock > 0 ? (product.sold_quantity / totalStock) * 100 : 0;
  
  // Price
  const price = parseFloat(product.price).toFixed(2);
  const originalPrice = product.original_price ? parseFloat(product.original_price).toFixed(2) : null;
  const hasDiscount = originalPrice && parseFloat(originalPrice) > parseFloat(price);
  
  // Stock status
  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

  // Handle add to cart
  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    // Check login
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please login to add products to cart');
      navigate('/auth');
      return;
    }

    if (isOutOfStock) {
      toast.error('This product is out of stock');
      return;
    }

    setAddingToCart(true);
    try {
      const response = await cartService.addToCart({
        product_id: product.product_id,
        quantity: 1
      });

      if (response.success) {
        toast.success('Added to cart successfully!');
        await fetchCartCount();
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        toast.error(response.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="product-card h-100 p-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
      {/* Product Image */}
      <Link
        to={productUrl}
        className="product-card__thumb flex-center rounded-8 bg-gray-50 position-relative"
        style={{ minHeight: '220px' }}
      >
        {/* Smart Badge */}
        {badge && (
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
          loading="lazy"
        />
      </Link>

      {/* Product Content */}
      <div className="product-card__content mt-16">
        {/* Rating Stars */}
        <div className="flex-align gap-6 mb-8">
          <div className="flex-align gap-4">
            {[...Array(5)].map((_, index) => (
              <span
                key={index}
                className={`text-15 fw-medium d-flex ${
                  index < ratingStars ? 'text-warning-600' : 'text-gray-400'
                }`}
              >
                <i className="ph-fill ph-star" />
              </span>
            ))}
          </div>
          <span className="text-xs fw-medium text-gray-500">
            {rating}
          </span>
          {reviewCount > 0 && (
            <span className="text-xs fw-medium text-gray-500">
              ({reviewCount})
            </span>
          )}
        </div>

        {/* Product Name */}
        <h6 className="title text-lg fw-semibold mb-8">
          <Link
            to={productUrl}
            className="link text-line-2"
            title={product.product_name}
          >
            {product.product_name}
          </Link>
        </h6>

        {/* Store Info */}
        <div className="flex-align gap-4 mb-12">
          <span className="text-main-600 text-md d-flex">
            <i className="ph-fill ph-storefront" />
          </span>
          <span className="text-gray-500 text-xs">
            By {storeName}
          </span>
        </div>

        {/* Stock Progress Bar */}
        {totalStock > 0 && (
          <div className="mb-12">
            <div
              className="progress w-100 bg-color-three rounded-pill h-4"
              role="progressbar"
              aria-label="Stock progress"
              aria-valuenow={Math.round(soldPercentage)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-bar bg-main-600 rounded-pill"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
            <div className="flex-between mt-4">
              <span className="text-gray-900 text-xs fw-medium">
                Sold: {product.sold_quantity}/{totalStock}
              </span>
              {isLowStock && (
                <span className="text-danger-600 text-xs fw-medium">
                  Only {product.stock_quantity} left!
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="product-card__price my-16">
          <div className="flex-align gap-8 flex-wrap">
            <span className="text-heading text-md fw-semibold">
              ${price}
              <span className="text-gray-500 fw-normal text-sm"> /Qty</span>
            </span>
            {hasDiscount && (
              <>
                <span className="text-gray-400 text-sm fw-medium text-decoration-line-through">
                  ${originalPrice}
                </span>
                <span className="text-danger-600 text-xs fw-semibold">
                  Save {Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || isOutOfStock}
          className={`product-card__cart btn w-100 py-11 px-24 rounded-8 flex-center gap-8 fw-medium transition-2 ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-main-50 text-main-600 hover-bg-main-600 hover-text-white'
          }`}
        >
          {addingToCart ? (
            <>
              <span className="spinner-border spinner-border-sm"></span>
              Adding...
            </>
          ) : isOutOfStock ? (
            <>
              <i className="ph ph-x-circle" />
              Out of Stock
            </>
          ) : (
            <>
              <i className="ph ph-shopping-cart" />
              Add To Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;