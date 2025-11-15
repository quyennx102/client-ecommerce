import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import discountService from '../../services/discountService';
// Bạn có thể import lại hàm formatDate
// import { formatDate } from '../../utils/formatDate'; 

const AdminDiscounts = () => {
    const [pendingCodes, setPendingCodes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = useCallback(async () => {
        setLoading(true);
        try {
            const response = await discountService.getPendingCodes();
            if (response.data.success) {
                setPendingCodes(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load pending codes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const handleReview = async (discountId, status) => {
        try {
            await discountService.reviewDiscountCode(discountId, status);
            toast.success(`Code ${status} successfully.`);
            // Xóa khỏi danh sách
            setPendingCodes(prev => prev.filter(code => code.discount_id !== discountId));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to review code');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-80">
                <div className="spinner-border text-main-600"></div>
            </div>
        );
    }

    return (
        <section className="py-80">
            <div className="container container-lg">
                <div className="mb-32 flex-between flex-wrap gap-16">
                    <h4 className="mb-0">Pending Discount Codes</h4>
                    <button onClick={fetchPending} className="btn btn-outline-main">
                        <i className="ph ph-arrows-clockwise me-8"></i>
                        Refresh
                    </button>
                </div>

                {pendingCodes.length === 0 ? (
                    <div className="text-center py-80">
                        <i className="ph ph-check-circle text-gray-300" style={{ fontSize: '80px' }}></i>
                        <h5 className="mt-24 mb-16">All clear!</h5>
                        <p className="text-gray-500 mb-32">There are no pending discount codes to review.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Store</th>
                                    <th>Type</th>
                                    <th>Value</th>
                                    <th>Min Order</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingCodes.map(code => (
                                    <tr key={code.discount_id}>
                                        {/* ... 4 cột <td> đầu tiên giữ nguyên ... */}
                                        <td>
                                            <strong className="text-dark">{code.code}</strong>
                                            <p className="text-gray-500 text-sm mb-0 text-truncate" style={{ maxWidth: '150px' }}>
                                                {code.description}
                                            </p>
                                        </td>
                                        <td>{code.store?.name || 'N/A'}</td>
                                        <td>{code.discount_type}</td>
                                        <td>
                                            {code.discount_type === 'percentage'
                                                ? `${code.discount_value}%`
                                                : `$${code.discount_value}`}
                                            {code.max_discount_amount && (
                                                <small className="d-block text-muted">(Max ${code.max_discount_amount})</small>
                                            )}
                                        </td>
                                        <td>${code.min_order_value}</td>

                                        {/* SỬA CỘT NÀY: Thêm "text-center" vào <td> 
           và "justify-content-center" vào <div>
      */}
                                        <td className="text-center">
                                            <div className="d-flex gap-8 justify-content-center">
                                                <button
                                                    onClick={() => handleReview(code.discount_id, 'approved')}
                                                    className="btn btn-sm btn-success"
                                                    title="Approve"
                                                >
                                                    <i className="ph ph-check"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleReview(code.discount_id, 'rejected')}
                                                    className="btn btn-sm btn-danger"
                                                    title="Reject"
                                                >
                                                    <i className="ph ph-x"></i>
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AdminDiscounts;