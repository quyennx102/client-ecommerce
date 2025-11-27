import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';
import reviewService from '../services/reviewService';
import ReviewModal from './ReviewModal';

const OrderDetail = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviewableProducts, setReviewableProducts] = useState(new Set());

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const response = await orderService.getOrderById(orderId);
            if (response.success) {
                setOrder(response.data);
                
                // If order is delivered, check which products can be reviewed
                if (response.data.order_status === 'delivered') {
                    await checkReviewableProducts(response.data.items);
                }
            }
        } catch (error) {
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const checkReviewableProducts = async (items) => {
        const reviewable = new Set();
        
        for (const item of items) {
            try {
                const response = await reviewService.canReviewProduct(
                    item.product_id,
                    orderId
                );
                
                if (response.success && response.data.can_review) {
                    reviewable.add(item.product_id);
                }
            } catch (error) {
                console.error(`Error checking review status for product ${item.product_id}`);
            }
        }
        
        setReviewableProducts(reviewable);
    };

    const handleReviewClick = (item) => {
        setSelectedProduct({
            product_id: item.product_id,
            product_name: item.product_name,
            price: item.product_price,
            image_url: item.product?.images?.[0]?.image_url
        });
        setShowReviewModal(true);
    };

    const handleReviewSubmitted = () => {
        // Remove from reviewable set
        setReviewableProducts(prev => {
            const newSet = new Set(prev);
            newSet.delete(selectedProduct.product_id);
            return newSet;
        });
        
        toast.success('Thank you for your review!');
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': 'badge bg-warning',
            'confirmed': 'badge bg-info',
            'shipping': 'badge bg-primary',
            'delivered': 'badge bg-success',
            'cancelled': 'badge bg-danger'
        };
        return badges[status] || 'badge bg-secondary';
    };

    const getPaymentBadge = (status) => {
        const badges = {
            'pending': 'badge bg-warning',
            'paid': 'badge bg-success',
            'failed': 'badge bg-danger'
        };
        return badges[status] || 'badge bg-secondary';
    };

    if (loading) {
        return (
            <section className="py-80">
                <div className="container">
                    <div className="text-center py-80">
                        <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
                        <p className="mt-16 text-gray-500">Loading order...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!order) {
        return (
            <section className="py-80">
                <div className="container">
                    <div className="text-center py-80">
                        <i className="ph ph-package text-gray-300" style={{ fontSize: '80px' }}></i>
                        <h5 className="mt-24">Order not found</h5>
                        <Link to="/orders/my-orders" className="btn btn-main mt-24">
                            View My Orders
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="py-80">
                <div className="container">
                    {/* Order Header */}
                    <div className="bg-white rounded-16 p-32 mb-32 shadow-sm">
                        <div className="flex-between flex-wrap gap-16 mb-24">
                            <div>
                                <h4 className="mb-8">Order #{order.order_id}</h4>
                                <p className="text-gray-600 mb-0">
                                    Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div className="text-end">
                                <div className="mb-8">
                                    <span className="text-gray-600 me-8">Order status:</span>
                                    <span className={getStatusBadge(order.order_status)}>
                                        {order.order_status}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600 me-8">Payment status:</span>
                                    <span className={getPaymentBadge(order.payment_status)}>
                                        {order.payment_status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <h6 className="mb-16">Shipping Address</h6>
                                <p className="text-gray-700 mb-8"><strong>Name:</strong> {order.shipping_name}</p>
                                <p className="text-gray-700 mb-8"><strong>Phone:</strong> {order.shipping_phone}</p>
                                <p className="text-gray-700 mb-0"><strong>Address:</strong> {order.shipping_address}</p>
                            </div>
                            <div className="col-md-6">
                                <h6 className="mb-16">Store Information</h6>
                                <div className="d-flex align-items-center gap-12">
                                    {order.store?.logo_url && (
                                        <img
                                            src={`${process.env.REACT_APP_IMAGE_URL}${order.store.logo_url}`}
                                            alt={order.store.store_name}
                                            className="rounded-8"
                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <div>
                                        <p className="text-gray-700 fw-semibold mb-0">{order.store?.store_name}</p>
                                        <Link to={`/stores/${order.store?.store_id}/products`} className="text-main-600 text-sm">
                                            Visit Store
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-16 p-32 mb-32 shadow-sm">
                        <h5 className="mb-24">Order Items</h5>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th className="text-center">Quantity</th>
                                        <th className="text-center">Subtotal</th>
                                        {order.order_status === 'delivered' && (
                                            <th className="text-end">Action</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items?.map(item => (
                                        <tr key={item.order_item_id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-12">
                                                    {item.product?.images?.[0] && (
                                                        <img
                                                            src={`${process.env.REACT_APP_IMAGE_URL}${item.product.images[0].image_url}`}
                                                            alt={item.product_name}
                                                            className="rounded-8"
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        />
                                                    )}
                                                    <span>{item.product_name}</span>
                                                </div>
                                            </td>
                                            <td>${parseFloat(item.product_price).toFixed(2)}</td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-center fw-semibold">${parseFloat(item.subtotal).toFixed(2)}</td>
                                            {order.order_status === 'delivered' && (
                                                <td className="text-end">
                                                    {reviewableProducts.has(item.product_id) ? (
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleReviewClick(item)}
                                                        >
                                                            <i className="ph ph-star me-4"></i>
                                                            Review
                                                        </button>
                                                    ) : (
                                                        <span className="badge bg-success-50 text-success-600">
                                                            <i className="ph ph-check me-4"></i>
                                                            Reviewed
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Order Summary */}
                        <div className="border-top pt-24 mt-24">
                            <div className="row">
                                <div className="col-md-6 ms-auto">
                                    <div className="d-flex justify-content-between mb-16">
                                        <span className="text-gray-700">Subtotal:</span>
                                        <span className="fw-semibold">${parseFloat(order.total_amount).toFixed(2)}</span>
                                    </div>
                                    {order.discount_amount > 0 && (
                                        <div className="d-flex justify-content-between mb-16">
                                            <span className="text-success-600">Discount:</span>
                                            <span className="text-success-600 fw-semibold">
                                                -${parseFloat(order.discount_amount).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between mb-16">
                                        <span className="text-gray-700">Shipping:</span>
                                        <span className="fw-semibold">Free</span>
                                    </div>
                                    <div className="d-flex justify-content-between pt-16 border-top">
                                        <span className="text-gray-900 fw-bold text-lg">Total:</span>
                                        <span className="text-main-600 fw-bold text-lg">
                                            ${parseFloat(order.final_amount).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-16 p-32 mb-32 shadow-sm">
                        <h6 className="mb-16">Payment Information</h6>
                        <div className="d-flex align-items-center gap-12">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="badge bg-gray-100 text-gray-700 px-12 py-6">
                                {order.payment_method?.toUpperCase()}
                            </span>
                            <span className={getPaymentBadge(order.payment_status)}>
                                {order.payment_status}
                            </span>
                        </div>
                        {order.payment_date && (
                            <p className="text-gray-600 text-sm mb-0 mt-8">
                                Paid on {new Date(order.payment_date).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="bg-white rounded-16 p-32 mb-32 shadow-sm">
                            <h6 className="mb-16">Order Notes</h6>
                            <p className="text-gray-700 mb-0">{order.notes}</p>
                        </div>
                    )}

                    {/* Back Button */}
                    <div className="text-center">
                        <Link to="/orders/my-orders" className="btn btn-outline-main px-40">
                            <i className="ph ph-arrow-left me-8"></i>
                            Back to Orders
                        </Link>
                    </div>
                </div>
            </section>

            {/* Review Modal */}
            <ReviewModal
                show={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                product={selectedProduct}
                orderId={orderId}
                onReviewSubmitted={handleReviewSubmitted}
            />
        </>
    );
};

export default OrderDetail;