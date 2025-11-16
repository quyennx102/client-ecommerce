// components/AddToCartButton.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AddToCartButton = ({ productId, stockQuantity, className = '', children }) => {
  const { user, addToCart, cartLoading } = useAuth(); // Sử dụng từ AuthContext
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (stockQuantity <= 0) {
      return;
    }

    await addToCart(productId, 1);
  };

  const isOutOfStock = stockQuantity <= 0;

  return (
    <button
      onClick={handleAddToCart}
      disabled={cartLoading || isOutOfStock}
      className={className || "btn btn-main py-18 px-40 rounded-8 flex-center gap-8"}
    >
      {cartLoading ? (
        <>
          <span className="spinner-border spinner-border-sm"></span>
          Adding...
        </>
      ) : isOutOfStock ? (
        <>
          <i className="ph ph-x-circle"></i>
          Out of Stock
        </>
      ) : (
        <>
          {children || (
            <>
              <i className="ph ph-shopping-cart"></i>
              Add To Cart
            </>
          )}
        </>
      )}
    </button>
  );
};

// Variant with quantity selector
export const AddToCartWithQuantity = ({ productId, stockQuantity, className = '' }) => {
  const { user, addToCart, cartLoading } = useAuth(); // Sử dụng từ AuthContext
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const success = await addToCart(productId, quantity);
    if (success) {
      setQuantity(1);
    }
  };

  const incrementQuantity = () => {
    if (quantity < stockQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const isOutOfStock = stockQuantity <= 0;

  return (
    <div className={`flex-align gap-16 ${className}`}>
      <div className="flex-align gap-8">
        <button
          className="btn btn-outline-main px-12 py-8"
          onClick={decrementQuantity}
          disabled={quantity <= 1 || cartLoading}
        >
          <i className="ph ph-minus"></i>
        </button>
        <input
          type="number"
          className="form-control text-center"
          style={{ width: '60px' }}
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1;
            if (val >= 1 && val <= stockQuantity) {
              setQuantity(val);
            }
          }}
          min="1"
          max={stockQuantity}
          disabled={cartLoading}
        />
        <button
          className="btn btn-outline-main px-12 py-8"
          onClick={incrementQuantity}
          disabled={quantity >= stockQuantity || cartLoading}
        >
          <i className="ph ph-plus"></i>
        </button>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={cartLoading || isOutOfStock}
        className="btn btn-main py-12 px-32 rounded-8 flex-center gap-8 flex-grow-1"
      >
        {cartLoading ? (
          <>
            <span className="spinner-border spinner-border-sm"></span>
            Adding...
          </>
        ) : isOutOfStock ? (
          <>
            <i className="ph ph-x-circle"></i>
            Out of Stock
          </>
        ) : (
          <>
            <i className="ph ph-shopping-cart"></i>
            Add To Cart
          </>
        )}
      </button>
    </div>
  );
};

export default AddToCartButton;