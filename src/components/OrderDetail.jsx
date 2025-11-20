import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';

const OrderDetail = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const response = await orderService.getOrderById(orderId);
            if (response.success) {
                setOrder(response.data);
            }
        } catch (error) {
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
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
        <section className="py-80">
            <div className="container">
                {/* Order Header */}
                <div className="bg-white rounded-16 p-32 mb-32 shadow-sm">
                    <div className="flex-between flex-wrap gap-16 mb-24">
                        <div>
                            <h4 className="mb-8">Order #{order.order_id}</h4>
                            <p className="text-gray-600 mb-0">
                                Placed on {new Date(order.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-end">
                            <span className="text-gray-600">Order status:  </span>
                            <span className={getStatusBadge(order.order_status)}>
                                {order.order_status}
                            </span>
                            <div className="mt-8">
                                <span className="text-gray-600">Payment status:  </span>
                                <span className={`badge ${order.payment_status === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                                    {order.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <h6 className="mb-16">Shipping Address</h6>
                            <p className="text-gray-700 mb-8">{order.shipping_name}</p>
                            <p className="text-gray-700 mb-8">{order.shipping_phone}</p>
                            <p className="text-gray-700 mb-0">{order.shipping_address}</p>
                        </div>
                        <div className="col-md-6">
                            <h6 className="mb-16">Store Information</h6>
                            <p className="text-gray-700 mb-0">{order.store?.store_name}</p>
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
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map(item => (
                                    <tr key={item.order_item_id}>
                                        <td>{item.product_name}</td>
                                        <td>${parseFloat(item.product_price).toFixed(2)}</td>
                                        <td>{item.quantity}</td>
                                        <td>${parseFloat(item.subtotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-top pt-24 mt-24">
                        <div className="row">
                            <div className="col-md-6 ms-auto">
                                <div className="flex-between mb-16">
                                    <span className="text-gray-700">Subtotal:</span>
                                    <span className="fw-semibold">${parseFloat(order.total_amount).toFixed(2)}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex-between mb-16">
                                        <span className="text-success-600">Discount:</span>
                                        <span className="text-success-600 fw-semibold">
                                            -${parseFloat(order.discount_amount).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-between mb-16">
                                    <span className="text-gray-700">Shipping:</span>
                                    <span className="fw-semibold">Free</span>
                                </div>
                                <div className="flex-between pt-16 border-top">
                                    <span className="text-gray-900 fw-bold text-lg">Total:</span>
                                    <span className="text-main-600 fw-bold text-lg">
                                        ${parseFloat(order.final_amount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="bg-white rounded-16 p-32 mb-32 shadow-sm">
                        <h6 className="mb-16">Order Notes</h6>
                        <p className="text-gray-700 mb-0">{order.notes}</p>
                    </div>
                )}

                <div className="text-center">
                    <Link to="/orders/my-orders" className="btn btn-outline-main px-40">
                        <i className="ph ph-arrow-left me-8"></i>
                        Back to Orders
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default OrderDetail;