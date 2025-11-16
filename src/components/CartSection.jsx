import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import cartService from '../services/cartService';
import { useAuth } from '../contexts/AuthContext';
import sweetAlert from '../utils/sweetAlert';

const CartSection = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, fetchCartCount } = useAuth(); // Thêm authLoading
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountLoading, setDiscountLoading] = useState(false);

    // Cart totals
    const [subtotal, setSubtotal] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [tax, setTax] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchCart();
    }, []); // Không cần check user nữa vì PrivateRoute đã handle

    useEffect(() => {
        calculateTotals();
    }, [cartItems, appliedDiscount]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await cartService.getCart();
            if (response.success) {
                setCartItems(response.data.items || []);
            }
            await fetchCartCount(); // Update cart count in header
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = () => {
        const sub = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        setSubtotal(sub);

        let discount = 0;
        if (appliedDiscount) {
            discount = parseFloat(appliedDiscount.discount_amount);
        }
        setDiscountAmount(discount);

        // Calculate tax (10%)
        const taxAmount = (sub - discount) * 0.1;
        setTax(taxAmount);

        // Calculate total
        setTotal(sub - discount + taxAmount);
    };

    const handleUpdateQuantity = async (cartId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdating(prev => ({ ...prev, [cartId]: true }));
        try {
            const response = await cartService.updateCartItem(cartId, newQuantity);
            if (response.success) {
                await fetchCart();
                toast.success('Cart updated');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update cart');
        } finally {
            setUpdating(prev => ({ ...prev, [cartId]: false }));
        }
    };

    const handleRemoveItem = async (item) => {
        const result = await sweetAlert.confirmRemoveItem(item.product_name);
        if (!result.isConfirmed) return;

        try {
            const response = await cartService.removeFromCart(item.cart_id);
            if (response.success) {
                await fetchCart();
                toast.success('Item removed from cart');
                // Clear discount if cart becomes empty
                if (cartItems.length <= 1) {
                    setAppliedDiscount(null);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove item');
        }
    };

    const handleApplyDiscount = async (e) => {
        e.preventDefault();

        if (!discountCode.trim()) {
            toast.error('Please enter a discount code');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        // Get store_id from first item (assuming all items from same store)
        const storeId = cartItems[0]?.store?.store_id;
        if (!storeId) {
            toast.error('Cannot apply discount');
            return;
        }

        setDiscountLoading(true);
        try {
            const response = await cartService.validateDiscountCode(
                discountCode,
                storeId,
                subtotal
            );

            if (response.success) {
                setAppliedDiscount(response.data);
                toast.success(response.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid discount code');
        } finally {
            setDiscountLoading(false);
        }
    };

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        toast.info('Discount removed');
    };

    const handleClearCart = async () => {
        const result = await sweetAlert.confirmClearCart();
        if (!result.isConfirmed) return;

        try {
            const response = await cartService.clearCart();
            if (response.success) {
                setCartItems([]);
                setAppliedDiscount(null);
                await fetchCartCount(); // Update cart count in header
                toast.success('Cart cleared');
            }
        } catch (error) {
            toast.error('Failed to clear cart');
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        // Store discount info in sessionStorage for checkout page
        if (appliedDiscount) {
            sessionStorage.setItem('appliedDiscount', JSON.stringify(appliedDiscount));
        }

        navigate('/checkout');
    };

    if (loading) {
        return (
            <section className="cart py-80">
                <div className="container container-lg">
                    <div className="text-center py-80">
                        <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
                        <p className="mt-16 text-gray-500">Loading cart...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (cartItems.length === 0) {
        return (
            <section className="cart py-80">
                <div className="container container-lg">
                    <div className="text-center py-80">
                        <i className="ph ph-shopping-cart text-gray-300" style={{ fontSize: '80px' }}></i>
                        <h5 className="mt-24 mb-16">Your cart is empty</h5>
                        <p className="text-gray-500 mb-32">Add some products to get started</p>
                        <Link to="/products" className="btn btn-main px-40">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="cart py-80">
            <div className="container container-lg">
                <div className="row gy-4">
                    <div className="col-xl-9 col-lg-8">
                        <div className="cart-table border border-gray-100 rounded-8 px-40 py-48">
                            <div className="overflow-x-auto scroll-sm scroll-sm-horizontal">
                                <table className="table style-three">
                                    <thead>
                                        <tr>
                                            <th className="h6 mb-0 text-lg fw-bold">Delete</th>
                                            <th className="h6 mb-0 text-lg fw-bold">Product Name</th>
                                            <th className="h6 mb-0 text-lg fw-bold">Price</th>
                                            <th className="h6 mb-0 text-lg fw-bold">Quantity</th>
                                            <th className="h6 mb-0 text-lg fw-bold">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.map(item => (
                                            <tr key={item.cart_id}>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="remove-tr-btn flex-align gap-12 hover-text-danger-600"
                                                        onClick={() => handleRemoveItem(item)}
                                                    >
                                                        <i className="ph ph-x-circle text-2xl d-flex" />
                                                        Remove
                                                    </button>
                                                </td>
                                                <td>
                                                    <div className="table-product d-flex align-items-center gap-24">
                                                        <Link
                                                            to={`/products/${item.product_id}`}
                                                            className="table-product__thumb border border-gray-100 rounded-8 flex-center"
                                                        >
                                                            <img
                                                                src={item.image ? `${process.env.REACT_APP_IMAGE_URL}${item.image}` : '/placeholder.jpg'}
                                                                alt={item.product_name}
                                                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                            />
                                                        </Link>
                                                        <div className="table-product__content text-start">
                                                            <h6 className="title text-lg fw-semibold mb-8">
                                                                <Link
                                                                    to={`/products/${item.product_id}`}
                                                                    className="link text-line-2"
                                                                >
                                                                    {item.product_name}
                                                                </Link>
                                                            </h6>
                                                            {item.store && (
                                                                <div className="flex-align gap-8 mb-8">
                                                                    <i className="ph ph-storefront text-gray-500"></i>
                                                                    <span className="text-sm text-gray-600">
                                                                        {item.store.store_name}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="text-sm text-gray-500">
                                                                Stock: {item.stock_available} available
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-lg h6 mb-0 fw-semibold">
                                                        ${parseFloat(item.price).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-8">
                                                        <button
                                                            className="btn btn-outline-main px-8 py-4"
                                                            onClick={() => handleUpdateQuantity(item.cart_id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || updating[item.cart_id]}
                                                        >
                                                            <i className="ph ph-minus"></i>
                                                        </button>
                                                        <input
                                                            type="number"
                                                            className="form-control text-center"
                                                            style={{ width: '60px' }}
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                if (val > 0 && val <= item.stock_available) {
                                                                    handleUpdateQuantity(item.cart_id, val);
                                                                }
                                                            }}
                                                            min="1"
                                                            max={item.stock_available}
                                                            disabled={updating[item.cart_id]}
                                                        />
                                                        <button
                                                            className="btn btn-outline-main px-8 py-4"
                                                            onClick={() => handleUpdateQuantity(item.cart_id, item.quantity + 1)}
                                                            disabled={item.quantity >= item.stock_available || updating[item.cart_id]}
                                                        >
                                                            <i className="ph ph-plus"></i>
                                                        </button>
                                                    </div>
                                                    {updating[item.cart_id] && (
                                                        <div className="text-center mt-8">
                                                            <span className="spinner-border spinner-border-sm"></span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="text-lg h6 mb-0 fw-semibold">
                                                        ${parseFloat(item.subtotal).toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Discount Code Section */}
                            <div className="flex-between flex-wrap gap-16 mt-32">
                                <form onSubmit={handleApplyDiscount} className="flex-align gap-16">
                                    <input
                                        type="text"
                                        className="common-input"
                                        placeholder="Enter discount code"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        disabled={discountLoading || appliedDiscount}
                                    />
                                    {appliedDiscount ? (
                                        <button
                                            type="button"
                                            className="btn btn-danger py-18 rounded-8"
                                            onClick={handleRemoveDiscount}
                                        >
                                            Remove Discount
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="btn btn-main py-18 w-100 rounded-8"
                                            disabled={discountLoading}
                                        >
                                            {discountLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-8"></span>
                                                    Applying...
                                                </>
                                            ) : (
                                                'Apply Coupon'
                                            )}
                                        </button>
                                    )}
                                </form>
                                <button
                                    type="button"
                                    className="text-lg text-danger-600 hover-text-danger-700"
                                    onClick={handleClearCart}
                                >
                                    <i className="ph ph-trash me-8"></i>
                                    Clear Cart
                                </button>
                            </div>

                            {/* Applied Discount */}
                            {appliedDiscount && (
                                <div className="alert alert-success mt-16 mb-0">
                                    <i className="ph ph-check-circle me-8"></i>
                                    Discount code <strong>{appliedDiscount.code}</strong> applied!
                                    You save ${parseFloat(appliedDiscount.discount_amount).toFixed(2)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart Summary Sidebar */}
                    <div className="col-xl-3 col-lg-4">
                        <div className="cart-sidebar border border-gray-100 rounded-8 px-24 py-40">
                            <h6 className="text-xl mb-32">Cart Totals</h6>

                            <div className="bg-color-three rounded-8 p-24">
                                <div className="mb-24 flex-between gap-8">
                                    <span className="text-gray-900 font-heading-two">Subtotal</span>
                                    <span className="text-gray-900 fw-semibold">
                                        ${subtotal.toFixed(2)}
                                    </span>
                                </div>

                                {appliedDiscount && (
                                    <div className="mb-24 flex-between gap-8">
                                        <span className="text-success-600 font-heading-two">Discount</span>
                                        <span className="text-success-600 fw-semibold">
                                            -${discountAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <div className="mb-24 flex-between gap-8">
                                    <span className="text-gray-900 font-heading-two">Tax (10%)</span>
                                    <span className="text-gray-900 fw-semibold">
                                        ${tax.toFixed(2)}
                                    </span>
                                </div>

                                <div className="mb-0 flex-between gap-8">
                                    <span className="text-gray-900 font-heading-two">Shipping</span>
                                    <span className="text-gray-900 fw-semibold">Free</span>
                                </div>
                            </div>

                            <div className="bg-color-three rounded-8 p-24 mt-24">
                                <div className="flex-between gap-8">
                                    <span className="text-gray-900 text-xl fw-semibold">Total</span>
                                    <span className="text-gray-900 text-xl fw-semibold">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="btn btn-main mt-40 py-18 w-100 rounded-8"
                            >
                                Proceed to checkout
                            </button>

                            <Link
                                to="/products"
                                className="btn btn-outline-main mt-16 py-18 w-100 rounded-8"
                            >
                                <i className="ph ph-arrow-left me-8"></i>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CartSection;