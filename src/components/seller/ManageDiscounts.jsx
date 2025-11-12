import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import discountService from '../../services/discountService';
import { formatDate } from '../../utils/formatDate';
import sweetAlert from '../../utils/sweetAlert';
const ManageDiscounts = () => {
  const { storeId } = useParams();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCodes = useCallback(async () => {
    try {
      const response = await discountService.getMyStoreCodes(storeId);
      if (response.data.success) {
        setCodes(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load discount codes');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleDelete = async (discountId, code) => {
    const result = await sweetAlert.confirmDelete(code);
    if (!result.isConfirmed) return;

    try {
      await discountService.deleteMyCode(discountId);
      toast.success('Discount code deleted');
      setCodes(prev => prev.filter(code => code.discount_id !== discountId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete code');
    }

  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge bg-warning text-dark',
      'approved': 'badge bg-success',
      'rejected': 'badge bg-danger',
      'expired': 'badge bg-secondary'
    };
    return badges[status] || 'badge bg-dark';
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
          <h4 className="mb-0">Manage Discount Codes</h4>
          <Link to={`/seller/stores/${storeId}/discounts/create`} className="btn btn-main py-18 px-40">
            <i className="ph ph-plus me-8"></i>
            Create New Code
          </Link>
        </div>

        {codes.length === 0 ? (
          <div className="text-center py-80">
            <i className="ph ph-ticket text-gray-300" style={{ fontSize: '80px' }}></i>
            <h5 className="mt-24 mb-16">No discount codes yet</h5>
            <p className="text-gray-500 mb-32">Create your first discount code to attract customers</p>
            <Link to={`/seller/stores/${storeId}/discounts/create`} className="btn btn-main px-40">
              Create Code
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Min Order</th>
                  <th>Usage</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map(code => (
                  <tr key={code.discount_id}>
                    <td>
                      <strong className="text-dark">{code.code}</strong>
                      <p className="text-gray-500 text-sm mb-0 text-truncate" style={{ maxWidth: '150px' }}>
                        {code.description}
                      </p>
                    </td>
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
                    <td>{code.used_count} / {code.usage_limit || '∞'}</td>
                    <td>{formatDate(code.end_date)}</td>
                    <td>
                      <span className={getStatusBadge(code.status)}>
                        {code.status}
                      </span>
                    </td>
                    <td>
                      {['pending', 'rejected'].includes(code.status) && (
                        // <button 
                        //   onClick={() => handleDelete(code.discount_id)}
                        //   className="btn btn-icon btn-sm btn-outline-danger" 
                        //   title="Delete Code"
                        // >
                        //   <i className="ph ph-trash"></i>
                        // </button>
                        <button
                          onClick={() => handleDelete(code.discount_id, code.code)}
                          className="btn bg-danger-50 text-danger-600 hover-bg-danger-600 hover-text-white py-8 px-16 rounded-8 flex-center gap-8 fw-medium flex-grow-1"
                        >
                          <i className="ph ph-trash"></i> Delete
                        </button>
                      )}
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

export default ManageDiscounts;