import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';
import sweetAlert from '../utils/sweetAlert';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Stats
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0
    });

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, currentPage]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm) {
                fetchOrders();
            } else if (searchTerm === '') {
                fetchOrders();
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10
            };
            
            if (statusFilter) params.status = statusFilter;
            if (searchTerm) params.search = searchTerm;

            const response = await orderService.getMyOrders(params);
            
            if (response.success) {
                setOrders(response.data);
                setPagination(response.pagination || {});
                calculateStats(response.data);
            }
        } catch (error) {
            toast.error('Failed to load orders');
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (ordersList) => {
        const stats = {
            total: ordersList.length,
            pending: 0,
            confirmed: 0,
            shipping: 0,
            delivered: 0,
            cancelled: 0
        };

        ordersList.forEach(order => {
            if (stats[order.order_status] !== undefined) {
                stats[order.order_status]++;
            }
        });

        setStats(stats);
    };

    const handleCancelOrder = async (orderId) => {
        const result = await sweetAlert.confirm(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            'warning'
        );

        if (!result.isConfirmed) return;

        try {
            setLoading(true);
            const response = await orderService.cancelOrder(orderId, {
                cancelled_reason: 'Customer requested cancellation'
            });

            if (response.success) {
                toast.success('Order cancelled successfully');
                fetchOrders();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': { class: 'bg-warning-50 text-warning-600', icon: 'ph-clock' },
            'confirmed': { class: 'bg-info-50 text-info-600', icon: 'ph-check-circle' },
            'shipping': { class: 'bg-primary-50 text-primary-600', icon: 'ph-truck' },
            'delivered': { class: 'bg-success-50 text-success-600', icon: 'ph-check' },
            'cancelled': { class: 'bg-danger-50 text-danger-600', icon: 'ph-x-circle' }
        };
        return badges[status] || { class: 'bg-gray-50 text-gray-600', icon: 'ph-info' };
    };

    const getPaymentBadge = (status) => {
        const badges = {
            'pending': { class: 'bg-warning-50 text-warning-600', text: 'Pending' },
            'paid': { class: 'bg-success-50 text-success-600', text: 'Paid' },
            'failed': { class: 'bg-danger-50 text-danger-600', text: 'Failed' }
        };
        return badges[status] || { class: 'bg-gray-50 text-gray-600', text: status };
    };

    if (loading && orders.length === 0) {
        return (
            <section className="py-80">
                <div className="container">
                    <div className="text-center py-80">
                        <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
                        <p className="mt-16 text-gray-500">Loading orders...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-80">
            <div className="container container-lg">
                {/* Header */}
                <div className="mb-40">
                    <h4 className="mb-8">My Orders</h4>
                    <p className="text-gray-600">Track and manage your orders</p>
                </div>

                {/* Stats Cards */}
                <div className="row g-16 mb-40">
                    <div className="col-lg-2 col-md-4 col-sm-6">
                        <div 
                            className={`stats-card ${!statusFilter ? 'active' : ''}`}
                            onClick={() => setStatusFilter('')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="stats-card__icon bg-main-50 text-main-600">
                                <i className="ph ph-shopping-bag"></i>
                            </div>
                            <div className="stats-card__content">
                                <h6 className="stats-card__number">{pagination.total_items || 0}</h6>
                                <span className="stats-card__label">Total Orders</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-4 col-sm-6">
                        <div 
                            className={`stats-card ${statusFilter === 'pending' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('pending')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="stats-card__icon bg-warning-50 text-warning-600">
                                <i className="ph ph-clock"></i>
                            </div>
                            <div className="stats-card__content">
                                <h6 className="stats-card__number">{stats.pending}</h6>
                                <span className="stats-card__label">Pending</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-4 col-sm-6">
                        <div 
                            className={`stats-card ${statusFilter === 'confirmed' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('confirmed')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="stats-card__icon bg-info-50 text-info-600">
                                <i className="ph ph-check-circle"></i>
                            </div>
                            <div className="stats-card__content">
                                <h6 className="stats-card__number">{stats.confirmed}</h6>
                                <span className="stats-card__label">Confirmed</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-4 col-sm-6">
                        <div 
                            className={`stats-card ${statusFilter === 'shipping' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('shipping')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="stats-card__icon bg-primary-50 text-primary-600">
                                <i className="ph ph-truck"></i>
                            </div>
                            <div className="stats-card__content">
                                <h6 className="stats-card__number">{stats.shipping}</h6>
                                <span className="stats-card__label">Shipping</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-4 col-sm-6">
                        <div 
                            className={`stats-card ${statusFilter === 'delivered' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('delivered')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="stats-card__icon bg-success-50 text-success-600">
                                <i className="ph ph-check"></i>
                            </div>
                            <div className="stats-card__content">
                                <h6 className="stats-card__number">{stats.delivered}</h6>
                                <span className="stats-card__label">Delivered</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-4 col-sm-6">
                        <div 
                            className={`stats-card ${statusFilter === 'cancelled' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('cancelled')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="stats-card__icon bg-danger-50 text-danger-600">
                                <i className="ph ph-x-circle"></i>
                            </div>
                            <div className="stats-card__content">
                                <h6 className="stats-card__number">{stats.cancelled}</h6>
                                <span className="stats-card__label">Cancelled</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="border border-gray-100 rounded-8 p-24 mb-32">
                    <div className="row g-16 align-items-center">
                        <div className="col-md-6">
                            <div className="position-relative">
                                <input
                                    type="text"
                                    className="common-input"
                                    placeholder="Search by order ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <i className="ph ph-magnifying-glass position-absolute top-50 translate-middle-y end-0 me-16 text-gray-500"></i>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex gap-8 justify-content-md-end">
                                <select
                                    className="common-input"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="shipping">Shipping</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {(statusFilter || searchTerm) && (
                                    <button
                                        className="btn btn-outline-main"
                                        onClick={() => {
                                            setStatusFilter('');
                                            setSearchTerm('');
                                        }}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="border border-gray-100 rounded-8 p-80 text-center">
                        <i className="ph ph-shopping-bag text-gray-300" style={{ fontSize: '80px' }}></i>
                        <h5 className="mt-24 mb-8">No orders found</h5>
                        <p className="text-gray-600 mb-24">
                            {statusFilter 
                                ? `You don't have any ${statusFilter} orders`
                                : "You haven't placed any orders yet"}
                        </p>
                        <Link to="/products" className="btn btn-main px-40">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        {orders.map((order) => {
                            const statusBadge = getStatusBadge(order.order_status);
                            const paymentBadge = getPaymentBadge(order.payment_status);

                            return (
                                <div key={order.order_id} className="order-card border border-gray-100 rounded-12 p-24 mb-24 hover-shadow transition-2">
                                    {/* Order Header */}
                                    <div className="d-flex justify-content-between align-items-start mb-24 pb-24 border-bottom border-gray-100">
                                        <div>
                                            <div className="d-flex align-items-center gap-12 mb-8">
                                                <h6 className="mb-0">Order #{order.order_id}</h6>
                                                <span className={`badge ${statusBadge.class} px-12 py-6`}>
                                                    <i className={`${statusBadge.icon} me-4`}></i>
                                                    {order.order_status}
                                                </span>
                                                <span className={`badge ${paymentBadge.class} px-12 py-6`}>
                                                    {paymentBadge.text}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-0">
                                                <i className="ph ph-calendar me-4"></i>
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-end">
                                            <p className="text-gray-600 text-sm mb-4">Total Amount</p>
                                            <h5 className="text-main-600 mb-0">${parseFloat(order.final_amount).toFixed(2)}</h5>
                                        </div>
                                    </div>

                                    {/* Store Info */}
                                    <div className="d-flex align-items-center gap-12 mb-24">
                                        <div className="store-logo">
                                            {order.store?.logo_url ? (
                                                <img
                                                    src={`${process.env.REACT_APP_IMAGE_URL}${order.store.logo_url}`}
                                                    alt={order.store.store_name}
                                                    className="rounded-8"
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="d-flex align-items-center justify-content-center bg-main-50 rounded-8" style={{ width: '40px', height: '40px' }}>
                                                    <i className="ph ph-storefront text-main-600"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-0">Store</p>
                                            <h6 className="mb-0">{order.store?.store_name}</h6>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="order-items mb-24">
                                        {order.items?.slice(0, 3).map((item, index) => (
                                            <div key={index} className="d-flex justify-content-between align-items-center py-12">
                                                <div className="d-flex align-items-center gap-12">
                                                    <span className="text-gray-600">{item.quantity}x</span>
                                                    <span className="text-gray-900">{item.product_name}</span>
                                                </div>
                                                <span className="text-gray-700 fw-medium">
                                                    ${parseFloat(item.subtotal).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                        {order.items?.length > 3 && (
                                            <p className="text-sm text-gray-600 mb-0 mt-8">
                                                +{order.items.length - 3} more item(s)
                                            </p>
                                        )}
                                    </div>

                                    {/* Shipping Info */}
                                    <div className="bg-gray-50 rounded-8 p-16 mb-24">
                                        <div className="row g-16">
                                            <div className="col-md-6">
                                                <p className="text-sm text-gray-600 mb-4">
                                                    <i className="ph ph-user me-4"></i>
                                                    {order.shipping_name}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-0">
                                                    <i className="ph ph-phone me-4"></i>
                                                    {order.shipping_phone}
                                                </p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="text-sm text-gray-600 mb-0">
                                                    <i className="ph ph-map-pin me-4"></i>
                                                    {order.shipping_address}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex gap-12 flex-wrap">
                                        <Link
                                            to={`/orders/${order.order_id}`}
                                            className="btn btn-outline-main flex-grow-1"
                                        >
                                            <i className="ph ph-eye me-8"></i>
                                            View Details
                                        </Link>

                                        {['pending', 'confirmed'].includes(order.order_status) && (
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleCancelOrder(order.order_id)}
                                                disabled={loading}
                                            >
                                                <i className="ph ph-x me-8" style={{color:'#fff'}}></i>
                                                Cancel Order
                                            </button>
                                        )}

                                        {order.payment_status === 'pending' && order.payment_method !== 'cod' && (
                                            <button
                                                className="btn btn-success"
                                                onClick={() => {
                                                    // Redirect to payment
                                                    window.location.href = `/payment/${order.order_id}`;
                                                }}
                                            >
                                                <i className="ph ph-credit-card me-8"></i>
                                                Pay Now
                                            </button>
                                        )}

                                        {order.order_status === 'delivered' && (
                                            <Link
                                                to={`/products?review=true`}
                                                className="btn btn-outline-success"
                                            >
                                                <i className="ph ph-star me-8"></i>
                                                Write Review
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        {pagination.total_pages > 1 && (
                            <div className="d-flex justify-content-center mt-40">
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <i className="ph ph-caret-left"></i>
                                        </button>
                                    </li>

                                    {[...Array(pagination.total_pages)].map((_, index) => {
                                        const page = index + 1;
                                        if (
                                            page === 1 ||
                                            page === pagination.total_pages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            );
                                        } else if (
                                            page === currentPage - 2 ||
                                            page === currentPage + 2
                                        ) {
                                            return <li key={page} className="page-item disabled"><span className="page-link">...</span></li>;
                                        }
                                        return null;
                                    })}

                                    <li className={`page-item ${currentPage === pagination.total_pages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === pagination.total_pages}
                                        >
                                            <i className="ph ph-caret-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style jsx>{`
                .stats-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.3s;
                }

                .stats-card:hover,
                .stats-card.active {
                    border-color: var(--main-600);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    transform: translateY(-2px);
                }

                .stats-card__icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .stats-card__number {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 4px;
                }

                .stats-card__label {
                    font-size: 13px;
                    color: #6b7280;
                }

                .order-card {
                    background: white;
                }

                .order-card:hover {
                    border-color: var(--main-600);
                }

                .hover-shadow {
                    transition: box-shadow 0.3s;
                }

                .hover-shadow:hover {
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
                }
            `}</style>
        </section>
    );
};

export default MyOrders;