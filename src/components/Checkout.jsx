import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import cartService from '../services/cartService';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';

const Checkout = () => {
    const navigate = useNavigate();
    const { user, fetchCartCount } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Cart data
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [total, setTotal] = useState(0);
    
    // Applied discount from cart page
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    
    // Form data
    const [formData, setFormData] = useState({
        shipping_name: user?.full_name || '',
        shipping_phone: user?.phone || '',
        shipping_address: '',
        shipping_city: '',
        shipping_state: '',
        shipping_postcode: '',
        notes: '',
        payment_method: 'cod'
    });

    useEffect(() => {
        fetchCartData();
        loadDiscountFromSession();
    }, []);

    useEffect(() => {
        calculateTotals();
    }, [cartItems, appliedDiscount]);

    const fetchCartData = async () => {
        setLoading(true);
        try {
            const response = await cartService.getCart();
            if (response.success) {
                if (!response.data.items || response.data.items.length === 0) {
                    toast.info('Your cart is empty');
                    navigate('/cart');
                    return;
                }
                await fetchCartCount();
                setCartItems(response.data.items);
            }
        } catch (error) {
            toast.error('Failed to load cart');
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    const loadDiscountFromSession = () => {
        const discountData = sessionStorage.getItem('appliedDiscount');
        if (discountData) {
            setAppliedDiscount(JSON.parse(discountData));
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

        const taxAmount = (sub - discount) * 0.1;
        setTax(taxAmount);

        setTotal(sub - discount + taxAmount);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePaymentChange = (method) => {
        setFormData(prev => ({
            ...prev,
            payment_method: method
        }));
    };

    const validateForm = () => {
        const required = ['shipping_name', 'shipping_phone', 'shipping_address'];
        for (const field of required) {
            if (!formData[field].trim()) {
                toast.error(`Please fill in ${field.replace('shipping_', '').replace('_', ' ')}`);
                return false;
            }
        }
        return true;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setSubmitting(true);
        try {
            // Create order
            const orderData = {
                ...formData,
                discount_code: appliedDiscount?.code || null
            };

            const response = await orderService.createOrder(orderData);
            
            if (response.success) {
                // Clear discount from session
                sessionStorage.removeItem('appliedDiscount');

                const orders = response.data;
                const firstOrder = orders[0];

                toast.success('Order placed successfully!');

                // Handle payment
                if (formData.payment_method === 'cod') {
                    // COD - redirect to success page
                    navigate(`/orders/${firstOrder.order_id}`, {
                        state: { message: 'Order placed successfully!' }
                    });
                } else if (formData.payment_method === 'momo') {
                    // MoMo payment
                    const paymentResponse = await paymentService.createMoMoPayment(firstOrder.order_id);
                    if (paymentResponse.success) {
                        // Redirect to MoMo payment page
                        window.location.href = paymentResponse.data.payUrl;
                    }
                } else if (formData.payment_method === 'zalopay') {
                    // ZaloPay payment
                    const paymentResponse = await paymentService.createZaloPayPayment(firstOrder.order_id);
                    if (paymentResponse.success) {
                        // Redirect to ZaloPay payment page
                        window.location.href = paymentResponse.data.orderUrl;
                    }
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section className="checkout py-80">
                <div className="container container-lg">
                    <div className="text-center py-80">
                        <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
                        <p className="mt-16 text-gray-500">Loading checkout...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="checkout py-80">
            <div className="container container-lg">
                {appliedDiscount && (
                    <div className="alert alert-success mb-32">
                        <i className="ph ph-check-circle me-8"></i>
                        Discount code <strong>{appliedDiscount.code}</strong> will be applied to your order
                    </div>
                )}

                <div className="border border-gray-100 rounded-8 px-30 py-20 mb-40">
                    <span>
                        Have a coupon?{" "}
                        <Link
                            to="/cart"
                            className="fw-semibold text-gray-900 hover-text-decoration-underline hover-text-main-600"
                        >
                            Click here to enter your code
                        </Link>
                    </span>
                </div>

                <form onSubmit={handlePlaceOrder}>
                    <div className="row">
                        {/* Shipping Information */}
                        <div className="col-xl-9 col-lg-8">
                            <div className="pe-xl-5">
                                <h5 className="mb-32">Shipping Information</h5>
                                <div className="row gy-3">
                                    <div className="col-sm-6">
                                        <label className="form-label">Full Name <span className="text-danger text-xl line-height-1">*</span>{" "}</label>
                                        <input
                                            type="text"
                                            name="shipping_name"
                                            className="common-input border-gray-100"
                                            placeholder="Enter your full name"
                                            value={formData.shipping_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-sm-6">
                                        <label htmlFor="phone" className="form-label">Phone Number <span className="text-danger text-xl line-height-1">*</span>{" "}</label>
                                        <input
                                            type="number"
                                            name="shipping_phone"
                                            className="common-input border-gray-100"
                                            placeholder="Enter your phone number"
                                            value={formData.shipping_phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Street Address <span className="text-danger text-xl line-height-1">*</span>{" "}</label>
                                        <input
                                            type="text"
                                            name="shipping_address"
                                            className="common-input border-gray-100"
                                            placeholder="House number and street name"
                                            value={formData.shipping_address}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-sm-6">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            name="shipping_city"
                                            className="common-input border-gray-100"
                                            placeholder="City"
                                            value={formData.shipping_city}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-sm-6">
                                        <label className="form-label">State/Province</label>
                                        <input
                                            type="text"
                                            name="shipping_state"
                                            className="common-input border-gray-100"
                                            placeholder="State/Province"
                                            value={formData.shipping_state}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Post Code</label>
                                        <input
                                            type="text"
                                            name="shipping_postcode"
                                            className="common-input border-gray-100"
                                            placeholder="Post Code"
                                            value={formData.shipping_postcode}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Order Notes (Optional)</label>
                                        <textarea
                                            name="notes"
                                            className="common-input border-gray-100"
                                            rows="4"
                                            placeholder="Notes about your order, e.g. special notes for delivery"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="col-xl-3 col-lg-4">
                            <div className="checkout-sidebar">
                                <div className="bg-color-three rounded-8 p-24 text-center mb-24">
                                    <span className="text-gray-900 text-xl fw-semibold">Your Order</span>
                                </div>

                                <div className="border border-gray-100 rounded-8 px-24 py-40">
                                    {/* Order Items */}
                                    <div className="mb-32 pb-32 border-bottom border-gray-100">
                                        <div className="flex-between gap-8 mb-24">
                                            <span className="text-gray-900 fw-medium text-lg">Product</span>
                                            <span className="text-gray-900 fw-medium text-lg">Subtotal</span>
                                        </div>
                                        {cartItems.map(item => (
                                            <div key={item.cart_id} className="flex-between gap-12 mb-16">
                                                <div className="flex-align gap-8">
                                                    <span className="text-gray-700 text-sm">
                                                        {item.product_name}
                                                    </span>
                                                    <span className="text-gray-500 text-sm">×</span>
                                                    <span className="text-gray-900 fw-semibold text-sm">
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                                <span className="text-gray-900 fw-bold text-sm">
                                                    ${parseFloat(item.subtotal).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Totals */}
                                    <div className="border-bottom border-gray-100 pb-24 mb-24">
                                        <div className="flex-between gap-8 mb-16">
                                            <span className="text-gray-700">Subtotal</span>
                                            <span className="text-gray-900 fw-semibold">${subtotal.toFixed(2)}</span>
                                        </div>
                                        {appliedDiscount && (
                                            <div className="flex-between gap-8 mb-16">
                                                <span className="text-success-600">Discount</span>
                                                <span className="text-success-600 fw-semibold">
                                                    -${discountAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-between gap-8 mb-16">
                                            <span className="text-gray-700">Tax (10%)</span>
                                            <span className="text-gray-900 fw-semibold">${tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex-between gap-8">
                                            <span className="text-gray-700">Shipping</span>
                                            <span className="text-gray-900 fw-semibold">Free</span>
                                        </div>
                                    </div>

                                    <div className="flex-between gap-8">
                                        <span className="text-gray-900 text-xl fw-semibold">Total</span>
                                        <span className="text-gray-900 text-xl fw-bold">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="mt-32">
                                    <h6 className="mb-24">Payment Method</h6>
                                    
                                    <div className="payment-item mb-16">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="payment"
                                                id="payment_cod"
                                                checked={formData.payment_method === 'cod'}
                                                onChange={() => handlePaymentChange('cod')}
                                            />
                                            <label className="form-check-label fw-semibold" htmlFor="payment_cod">
                                                Cash on Delivery (COD)
                                            </label>
                                        </div>
                                        {formData.payment_method === 'cod' && (
                                            <div className="payment-item__content px-16 py-16 mt-12 rounded-8 bg-main-50">
                                                <p className="text-gray-800 text-sm mb-0">
                                                    Pay with cash upon delivery.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="payment-item mb-16">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="payment"
                                                id="payment_momo"
                                                checked={formData.payment_method === 'momo'}
                                                onChange={() => handlePaymentChange('momo')}
                                            />
                                            <label className="form-check-label fw-semibold" htmlFor="payment_momo">
                                                MoMo E-Wallet
                                            </label>
                                        </div>
                                        {formData.payment_method === 'momo' && (
                                            <div className="payment-item__content px-16 py-16 mt-12 rounded-8 bg-main-50">
                                                <p className="text-gray-800 text-sm mb-0">
                                                    Pay securely with MoMo e-wallet. You will be redirected to MoMo payment page.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="payment-item mb-16">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="payment"
                                                id="payment_zalopay"
                                                checked={formData.payment_method === 'zalopay'}
                                                onChange={() => handlePaymentChange('zalopay')}
                                            />
                                            <label className="form-check-label fw-semibold" htmlFor="payment_zalopay">
                                                ZaloPay
                                            </label>
                                        </div>
                                        {formData.payment_method === 'zalopay' && (
                                            <div className="payment-item__content px-16 py-16 mt-12 rounded-8 bg-main-50">
                                                <p className="text-gray-800 text-sm mb-0">
                                                    Pay securely with ZaloPay. You will be redirected to ZaloPay payment page.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-24 pt-24 border-top border-gray-100">
                                    <p className="text-gray-500 text-sm">
                                        Your personal data will be used to process your order and support your experience throughout this website.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-main mt-32 py-18 w-100 rounded-8"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-8"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        'Place Order'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Checkout;