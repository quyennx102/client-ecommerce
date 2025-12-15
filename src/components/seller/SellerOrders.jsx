// src/components/SellerOrders.jsx
import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; // Không cần Link để navigate nữa
import { toast } from 'react-toastify';
import sellerOrderService from '../../services/sellerOrderService';

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [storeFilter, setStoreFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal state
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // --- MỚI: State cho modal chi tiết ---
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newPaymentStatus, setNewPaymentStatus] = useState('');

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
        fetchStores();
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, storeFilter, currentPage]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm || searchTerm === '') {
                fetchOrders();
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const fetchStores = async () => {
        try {
            const response = await sellerOrderService.getSellerStores();
            if (response.success) {
                setStores(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load stores:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10
            };

            if (statusFilter) params.status = statusFilter;
            if (storeFilter) params.store_id = storeFilter;
            if (searchTerm) params.search = searchTerm;

            const response = await sellerOrderService.getSellerOrders(params);

            if (response.success) {
                setOrders(response.data || []);
                setPagination(response.pagination || {});
                calculateStats(response.data || []);
            }
        } catch (error) {
            toast.error('Failed to load orders');
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (ordersList) => {
        const newStats = {
            total: ordersList.length,
            pending: 0,
            confirmed: 0,
            shipping: 0,
            delivered: 0,
            cancelled: 0
        };

        ordersList.forEach(order => {
            if (newStats[order.order_status] !== undefined) {
                newStats[order.order_status]++;
            }
        });

        setStats(newStats);
    };

    // Open Detail Modal ---
    const openDetailModal = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    // Open status modal
    const openStatusModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.order_status);
        setShowStatusModal(true);
    };

    // Open payment modal
    const openPaymentModal = (order) => {
        setSelectedOrder(order);
        setNewPaymentStatus(order.payment_status);
        setShowPaymentModal(true);
    };

    // Handle update order status
    const handleUpdateOrderStatus = async () => {
        if (!selectedOrder || !newStatus) return;

        try {
            setLoading(true);
            const response = await sellerOrderService.updateOrderStatus(
                selectedOrder.order_id,
                newStatus
            );

            if (response.success) {
                toast.success('Order status updated successfully');
                setShowStatusModal(false);
                fetchOrders();
                // Nếu đang mở modal chi tiết cùng lúc (trường hợp hiếm), cập nhật lại selectedOrder
                if (showDetailModal && selectedOrder.order_id === response.data?.order_id) {
                    setSelectedOrder({ ...selectedOrder, order_status: newStatus });
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    // Handle update payment status
    const handleUpdatePaymentStatus = async () => {
        if (!selectedOrder || !newPaymentStatus) return;

        try {
            setLoading(true);
            const response = await sellerOrderService.updatePaymentStatus(
                selectedOrder.order_id,
                newPaymentStatus
            );

            if (response.success) {
                toast.success('Payment status updated successfully');
                setShowPaymentModal(false);
                fetchOrders();
                if (showDetailModal && selectedOrder.order_id === response.data?.order_id) {
                    setSelectedOrder({ ...selectedOrder, payment_status: newPaymentStatus });
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update payment status');
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
            'failed': { class: 'bg-danger-50 text-danger-600', text: 'Failed' },
            'refunded': { class: 'bg-purple-50 text-purple-600', text: 'Refunded' }
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
        <>
            <section className="py-80">
                <div className="container container-lg">
                    {/* Header */}
                    <div className="mb-40">
                        <h4 className="mb-8">Manage Orders</h4>
                        <p className="text-gray-600">View and manage orders from your stores</p>
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
                                    <h6 className="stats-card__number">{pagination.totalItems || 0}</h6>
                                    <span className="stats-card__label">Total Orders</span>
                                </div>
                            </div>
                        </div>
                        {/* Các stats card khác giữ nguyên, rút gọn để hiển thị logic chính */}
                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className={`stats-card ${statusFilter === 'pending' ? 'active' : ''}`} onClick={() => setStatusFilter('pending')} style={{ cursor: 'pointer' }}>
                                <div className="stats-card__icon bg-warning-50 text-warning-600"><i className="ph ph-clock"></i></div>
                                <div className="stats-card__content"><h6 className="stats-card__number">{stats.pending}</h6><span className="stats-card__label">Pending</span></div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className={`stats-card ${statusFilter === 'confirmed' ? 'active' : ''}`} onClick={() => setStatusFilter('confirmed')} style={{ cursor: 'pointer' }}>
                                <div className="stats-card__icon bg-info-50 text-info-600"><i className="ph ph-check-circle"></i></div>
                                <div className="stats-card__content"><h6 className="stats-card__number">{stats.confirmed}</h6><span className="stats-card__label">Confirmed</span></div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className={`stats-card ${statusFilter === 'shipping' ? 'active' : ''}`} onClick={() => setStatusFilter('shipping')} style={{ cursor: 'pointer' }}>
                                <div className="stats-card__icon bg-primary-50 text-primary-600"><i className="ph ph-truck"></i></div>
                                <div className="stats-card__content"><h6 className="stats-card__number">{stats.shipping}</h6><span className="stats-card__label">Shipping</span></div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className={`stats-card ${statusFilter === 'delivered' ? 'active' : ''}`} onClick={() => setStatusFilter('delivered')} style={{ cursor: 'pointer' }}>
                                <div className="stats-card__icon bg-success-50 text-success-600"><i className="ph ph-check"></i></div>
                                <div className="stats-card__content"><h6 className="stats-card__number">{stats.delivered}</h6><span className="stats-card__label">Delivered</span></div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-4 col-sm-6">
                            <div className={`stats-card ${statusFilter === 'cancelled' ? 'active' : ''}`} onClick={() => setStatusFilter('cancelled')} style={{ cursor: 'pointer' }}>
                                <div className="stats-card__icon bg-danger-50 text-danger-600"><i className="ph ph-x-circle"></i></div>
                                <div className="stats-card__content"><h6 className="stats-card__number">{stats.cancelled}</h6><span className="stats-card__label">Cancelled</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="border border-gray-100 rounded-8 p-24 mb-32">
                        <div className="row g-16 align-items-center">
                            <div className="col-md-4">
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="common-input"
                                        placeholder="Search by order ID or customer name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <i className="ph ph-magnifying-glass position-absolute top-50 translate-middle-y end-0 me-16 text-gray-500"></i>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="d-flex gap-8 justify-content-md-end flex-wrap">
                                    <select
                                        className="common-input"
                                        value={storeFilter}
                                        onChange={(e) => setStoreFilter(e.target.value)}
                                        style={{ minWidth: '200px' }}
                                    >
                                        <option value="">All Stores</option>
                                        {stores.map(store => (
                                            <option key={store.store_id} value={store.store_id}>
                                                {store.store_name}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        className="common-input"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        style={{ minWidth: '150px' }}
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="shipping">Shipping</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    {(statusFilter || storeFilter || searchTerm) && (
                                        <button
                                            className="btn btn-outline-main"
                                            onClick={() => {
                                                setStatusFilter('');
                                                setStoreFilter('');
                                                setSearchTerm('');
                                            }}
                                        >
                                            <i className="ph ph-x me-8"></i>
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
                                    : "You haven't received any orders yet"}
                            </p>
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
                                                <div className="d-flex align-items-center gap-12 mb-8 flex-wrap">
                                                    <h6 className="mb-0">Order #{order.order_id}</h6>
                                                    <span
                                                        className={`badge ${statusBadge.class} px-12 py-6`}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => openStatusModal(order)}
                                                        title="Click to change status"
                                                    >
                                                        <i className={`${statusBadge.icon} me-4`}></i>
                                                        {order.order_status}
                                                        <i className="ph ph-pencil-simple ms-4"></i>
                                                    </span>
                                                    <span
                                                        className={`badge ${paymentBadge.class} px-12 py-6`}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => openPaymentModal(order)}
                                                        title="Click to change payment status"
                                                    >
                                                        {paymentBadge.text}
                                                        <i className="ph ph-pencil-simple ms-4"></i>
                                                    </span>
                                                    {order.payment_method && (
                                                        <span className="badge bg-gray-100 text-gray-700 px-12 py-6">
                                                            {order.payment_method.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 text-sm mb-0">
                                                    <i className="ph ph-calendar me-4"></i>
                                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-end">
                                                <p className="text-gray-600 text-sm mb-4">Total Amount</p>
                                                <h5 className="text-main-600 mb-0">${parseFloat(order.final_amount).toFixed(2)}</h5>
                                            </div>
                                        </div>

                                        {/* Store Info */}
                                        {order.store && (
                                            <div className="d-flex align-items-center gap-12 mb-24 pb-24 border-bottom border-gray-100">
                                                <div className="store-logo">
                                                    {order.store.logo_url ? (
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
                                                    <h6 className="mb-0">{order.store.store_name}</h6>
                                                </div>
                                            </div>
                                        )}

                                        {/* Customer Info */}
                                        <div className="bg-gray-50 rounded-8 p-16 mb-24">
                                            <h6 className="mb-12 text-sm text-gray-700">Customer Information</h6>
                                            <div className="row g-16">
                                                <div className="col-md-6">
                                                    <p className="text-sm text-gray-600 mb-4">
                                                        <i className="ph ph-user me-4"></i>
                                                        <strong>Name:</strong> {order.customer?.full_name || order.shipping_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mb-0">
                                                        <i className="ph ph-phone me-4"></i>
                                                        <strong>Phone:</strong> {order.customer?.phone || order.shipping_phone}
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <p className="text-sm text-gray-600 mb-0">
                                                        <i className="ph ph-map-pin me-4"></i>
                                                        <strong>Address:</strong> {order.shipping_address}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items Preview */}
                                        <div className="order-items mb-24">
                                            <h6 className="mb-12 text-sm text-gray-700">Order Items</h6>
                                            {order.items?.slice(0, 3).map((item, index) => (
                                                <div key={index} className="d-flex justify-content-between align-items-center py-12 border-bottom border-gray-100">
                                                    <div className="d-flex align-items-center gap-12">
                                                        <span className="badge bg-main-50 text-main-600">{item.quantity}x</span>
                                                        <span className="text-gray-900">{item.product_name}</span>
                                                        <span className="text-gray-500 text-sm">${parseFloat(item.product_price).toFixed(2)} each</span>
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

                                        {/* Action Buttons */}
                                        <div className="d-flex gap-12 flex-wrap">
                                            {/* Thay thế Link bằng Button mở Modal */}
                                            <button
                                                className="btn btn-outline-main"
                                                onClick={() => openDetailModal(order)}
                                            >
                                                <i className="ph ph-eye me-8"></i>
                                                View Details
                                            </button>

                                            <button
                                                className="btn btn-primary"
                                                onClick={() => openStatusModal(order)}
                                            >
                                                <i className="ph ph-arrows-clockwise me-8"></i>
                                                Update Status
                                            </button>

                                            <button
                                                className="btn btn-success"
                                                onClick={() => openPaymentModal(order)}
                                            >
                                                <i className="ph ph-credit-card me-8"></i>
                                                Update Payment
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-40">
                                    <ul className="pagination">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                                                <i className="ph ph-caret-left"></i>
                                            </button>
                                        </li>
                                        {[...Array(pagination.totalPages)].map((_, index) => {
                                            const page = index + 1;
                                            if (page === 1 || page === pagination.totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                                return (
                                                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                        <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                                                    </li>
                                                );
                                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                return <li key={page} className="page-item disabled"><span className="page-link">...</span></li>;
                                            }
                                            return null;
                                        })}
                                        <li className={`page-item ${currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === pagination.totalPages}>
                                                <i className="ph ph-caret-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* --- MỚI: Order Detail Modal --- */}
            {showDetailModal && selectedOrder && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg"> {/* modal-lg để rộng hơn */}
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Order Details #{selectedOrder.order_id}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDetailModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body p-24" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                                {/* Thông tin chung */}
                                <div className="d-flex justify-content-between flex-wrap gap-16 mb-24 border-bottom pb-16">
                                    <div>
                                        <p className="text-gray-600 mb-0">
                                            Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-end">
                                        <div className="mb-8">
                                            <span className="text-gray-600 me-2">Status:</span>
                                            <span className={`badge ${getStatusBadge(selectedOrder.order_status).class}`}>
                                                {selectedOrder.order_status}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 me-2">Payment:</span>
                                            <span className={`badge ${getPaymentBadge(selectedOrder.payment_status).class}`}>
                                                {getPaymentBadge(selectedOrder.payment_status).text}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin khách hàng & Giao hàng */}
                                <div className="row g-24 mb-32">
                                    <div className="col-md-6">
                                        <div className="bg-gray-50 rounded-8 p-16 h-100">
                                            <h6 className="mb-16 border-bottom pb-8">Shipping Address</h6>
                                            <p className="text-gray-700 mb-4 fw-bold">{selectedOrder.shipping_name || selectedOrder.customer?.full_name}</p>
                                            <p className="text-gray-700 mb-4">{selectedOrder.shipping_phone || selectedOrder.customer?.phone}</p>
                                            <p className="text-gray-700 mb-0">{selectedOrder.shipping_address}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-gray-50 rounded-8 p-16 h-100">
                                            <h6 className="mb-16 border-bottom pb-8">Store Information</h6>
                                            <p className="text-gray-700 mb-4 fw-bold">{selectedOrder.store?.store_name}</p>
                                            <p className="text-gray-600 mb-0 text-sm">Payment Method: {selectedOrder.payment_method?.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bảng sản phẩm */}
                                <h6 className="mb-16">Order Items</h6>
                                <div className="table-responsive border rounded-8 mb-24">
                                    <table className="table mb-0">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-12 px-16">Product</th>
                                                <th className="py-12 px-16 text-end">Price</th>
                                                <th className="py-12 px-16 text-center">Qty</th>
                                                <th className="py-12 px-16 text-end">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-12 px-16 align-middle">{item.product_name}</td>
                                                    <td className="py-12 px-16 align-middle text-end">${parseFloat(item.product_price).toFixed(2)}</td>
                                                    <td className="py-12 px-16 align-middle text-center">{item.quantity}</td>
                                                    <td className="py-12 px-16 align-middle text-end fw-medium">${parseFloat(item.subtotal).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Tổng tiền */}
                                <div className="row">
                                    <div className="col-md-6 ms-auto">
                                        <div className="d-flex justify-content-between mb-8">
                                            <span className="text-gray-600">Subtotal:</span>
                                            {/* Giả sử object order có total_amount, nếu không dùng final_amount */}
                                            <span className="fw-medium">${parseFloat(selectedOrder.total_amount || selectedOrder.final_amount).toFixed(2)}</span>
                                        </div>
                                        {parseFloat(selectedOrder.discount_amount) > 0 && (
                                            <div className="d-flex justify-content-between mb-8">
                                                <span className="text-success-600">Discount:</span>
                                                <span className="text-success-600 fw-medium">-${parseFloat(selectedOrder.discount_amount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between mb-8">
                                            <span className="text-gray-600">Shipping:</span>
                                            <span className="fw-medium">Free</span>
                                        </div>
                                        <div className="d-flex justify-content-between pt-16 border-top mt-8">
                                            <span className="text-gray-900 fw-bold fs-5">Total:</span>
                                            <span className="text-main-600 fw-bold fs-5">
                                                ${parseFloat(selectedOrder.final_amount).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ghi chú */}
                                {selectedOrder.notes && (
                                    <div className="alert alert-secondary mt-24 mb-0">
                                        <h6 className="alert-heading text-sm mb-8"><i className="ph ph-note me-4"></i> Order Notes</h6>
                                        <p className="mb-0 text-sm">{selectedOrder.notes}</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        openStatusModal(selectedOrder);
                                    }}
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Status Modal */}
            {showStatusModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Update Order Status</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowStatusModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-gray-600 mb-16">
                                    Update status for Order #{selectedOrder?.order_id}
                                </p>
                                <div className="mb-16">
                                    <label className="form-label">Select New Status</label>
                                    <select
                                        className="form-select"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="shipping">Shipping</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="alert alert-info">
                                    <i className="ph ph-info me-8"></i>
                                    <small>
                                        {newStatus === 'delivered' && selectedOrder?.payment_method === 'cod'
                                            ? 'Note: Marking as delivered will automatically set payment status to "Paid" for COD orders.'
                                            : 'Changing the order status will notify the customer.'}
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowStatusModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleUpdateOrderStatus}
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Status Modal */}
            {showPaymentModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Update Payment Status</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowPaymentModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-gray-600 mb-16">
                                    Update payment status for Order #{selectedOrder?.order_id}
                                </p>
                                <div className="mb-16">
                                    <label className="form-label">Select Payment Status</label>
                                    <select
                                        className="form-select"
                                        value={newPaymentStatus}
                                        onChange={(e) => setNewPaymentStatus(e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                                <div className="mb-16">
                                    <p className="text-sm text-gray-600 mb-8">
                                        <strong>Payment Method:</strong> {selectedOrder?.payment_method?.toUpperCase()}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-0">
                                        <strong>Current Status:</strong> {selectedOrder?.payment_status}
                                    </p>
                                </div>
                                <div className="alert alert-warning">
                                    <i className="ph ph-warning me-8"></i>
                                    <small>
                                        {newPaymentStatus === 'paid'
                                            ? 'Marking as paid will confirm the order and notify the customer.'
                                            : newPaymentStatus === 'refunded'
                                                ? 'This will mark the payment as refunded. Please ensure you have processed the refund through your payment gateway.'
                                                : 'Changing the payment status will notify the customer.'}
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowPaymentModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleUpdatePaymentStatus}
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Payment Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                    flex-shrink: 0;
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

                .badge {
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                }

                .modal {
                    z-index: 1050;
                }

                /* Thêm style cho modal-lg nếu bootstrap chưa có hoặc cần override */
                .modal-lg {
                    max-width: 800px;
                }

                .modal-content {
                    border-radius: 12px;
                    border: none;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }

                .modal-header {
                    border-bottom: 1px solid #e5e7eb;
                    padding: 20px 24px;
                }

                .modal-body {
                    padding: 24px;
                }

                .modal-footer {
                    border-top: 1px solid #e5e7eb;
                    padding: 16px 24px;
                }

                .form-select {
                    padding: 10px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.3s;
                }

                .form-select:focus {
                    border-color: var(--main-600);
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(var(--main-600-rgb), 0.1);
                }

                .alert {
                    padding: 12px 16px;
                    border-radius: 8px;
                    border: none;
                    display: flex;
                    align-items: start;
                }
                
                /* Đảm bảo nội dung trong alert display block khi có nhiều thành phần con */
                .alert-secondary {
                    background-color: #f3f4f6;
                    color: #4b5563;
                    display: block; 
                }

                .alert-info {
                    background-color: #dbeafe;
                    color: #1e40af;
                }

                .alert-warning {
                    background-color: #fef3c7;
                    color: #92400e;
                }

                .bg-purple-50 {
                    background-color: #faf5ff;
                }

                .text-purple-600 {
                    color: #9333ea;
                }
            `}</style>
        </>
    );
};

export default SellerOrders;