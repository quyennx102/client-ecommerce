import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import discountService from '../../services/discountService';

const CreateDiscountCode = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage', // 'percentage' or 'fixed_amount'
    discount_value: '',
    min_order_value: '0',
    max_discount_amount: '',
    usage_limit: '',
    start_date: '',
    end_date: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Dọn dẹp data trước khi gửi
    const dataToSend = { ...formData };
    if (dataToSend.discount_type !== 'percentage') {
      delete dataToSend.max_discount_amount; // Chỉ gửi nếu là %
    }
    if (!dataToSend.max_discount_amount) delete dataToSend.max_discount_amount;
    if (!dataToSend.usage_limit) delete dataToSend.usage_limit;

    try {
      await discountService.createDiscountCode(storeId, dataToSend);
      toast.success('Discount code created successfully! Waiting for approval.');
      navigate(`/seller/stores/${storeId}/discounts`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create code');
      setLoading(false);
    }
  };

  return (
    <section className="py-80">
      <div className="container container-md">
        <div className="border border-gray-100 rounded-16 p-32 p-lg-48">
          <h4 className="mb-32">Create New Discount Code</h4>
          <form onSubmit={handleSubmit}>
            <div className="row gy-4">
              <div className="col-12">
                <label className="form-label">Discount Code <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="code"
                  className="form-control"
                  placeholder="E.g. BLACKFRIDAY20"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="Short description for your customers"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="col-md-6">
                <label className="form-label">Discount Type <span className="text-danger">*</span></label>
                <select
                  name="discount_type"
                  className="form-select"
                  value={formData.discount_type}
                  onChange={handleChange}
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Discount Value <span className="text-danger">*</span></label>
                <input
                  type="number"
                  name="discount_value"
                  className="form-control"
                  placeholder={formData.discount_type === 'percentage' ? 'E.g. 10 (for 10%)' : 'E.g. 5 (for $5)'}
                  value={formData.discount_value}
                  onChange={handleChange}
                  required
                />
              </div>

              {formData.discount_type === 'percentage' && (
                <div className="col-md-6">
                  <label className="form-label">Max Discount Amount (Optional)</label>
                  <input
                    type="number"
                    name="max_discount_amount"
                    className="form-control"
                    placeholder="E.g. 50 (max $50 off)"
                    value={formData.max_discount_amount}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label">Min Order Value (Optional)</label>
                <input
                  type="number"
                  name="min_order_value"
                  className="form-control"
                  placeholder="E.g. 100 (for $100)"
                  value={formData.min_order_value}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Usage Limit (Optional)</label>
                <input
                  type="number"
                  name="usage_limit"
                  className="form-control"
                  placeholder="E.g. 100 (total uses)"
                  value={formData.usage_limit}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Start Date <span className="text-danger">*</span></label>
                <input
                  type="datetime-local"
                  name="start_date"
                  className="form-control"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label">End Date <span className="text-danger">*</span></label>
                <input
                  type="datetime-local"
                  name="end_date"
                  className="form-control"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 mt-48">
                <button type="submit" className="btn btn-main py-18 px-48 w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Code'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CreateDiscountCode;