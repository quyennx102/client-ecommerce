import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const SellerRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Account Info, 2: Business Info
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Account Information
  const [accountData, setAccountData] = useState({
    full_name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: ''
  });

  // Business Information
  const [businessData, setBusinessData] = useState({
    business_name: '',
    business_type: 'individual', // individual, company
    tax_id: '',
    business_address: '',
    business_phone: '',
    bank_account: '',
    bank_name: '',
    account_holder_name: ''
  });

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData(prev => ({ ...prev, [name]: value }));
  };

  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!accountData.full_name || !accountData.email || !accountData.password || !accountData.phone) {
      toast.error('Please fill in all required fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(accountData.email)) {
      toast.error('Invalid email format');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(accountData.password)) {
      toast.error('Password must be at least 8 characters with uppercase, lowercase and number');
      return false;
    }

    if (accountData.password !== accountData.passwordConfirm) {
      toast.error('Passwords do not match');
      return false;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(accountData.phone)) {
      toast.error('Invalid phone number (10-11 digits)');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!businessData.business_name || !businessData.business_phone) {
      toast.error('Please fill in all required business information');
      return false;
    }

    if (businessData.business_type === 'company' && !businessData.tax_id) {
      toast.error('Tax ID is required for company registration');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        ...accountData,
        role: 'seller',
        business_info: businessData
      };

      const response = await authService.register(registerData);

      if (response.success) {
        toast.success('Seller registration successful! Your account is pending approval.');
        
        // Auto login
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="account py-80">
      <div className="container container-lg">
        <div className="row justify-content-center">
          <div className="col-xl-8">
            {/* Progress Steps */}
            <div className="mb-48">
              <div className="d-flex align-items-center justify-content-center gap-32">
                <div className={`flex-align gap-8 ${step >= 1 ? 'text-main-600' : 'text-gray-400'}`}>
                  <span className={`w-40 h-40 flex-center rounded-circle fw-bold ${step >= 1 ? 'bg-main-600 text-white' : 'bg-gray-100'}`}>
                    1
                  </span>
                  <span className="fw-medium">Account Info</span>
                </div>
                <div className={`w-80 h-2 ${step >= 2 ? 'bg-main-600' : 'bg-gray-200'}`}></div>
                <div className={`flex-align gap-8 ${step >= 2 ? 'text-main-600' : 'text-gray-400'}`}>
                  <span className={`w-40 h-40 flex-center rounded-circle fw-bold ${step >= 2 ? 'bg-main-600 text-white' : 'bg-gray-100'}`}>
                    2
                  </span>
                  <span className="fw-medium">Business Info</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-100 rounded-16 px-40 py-48">
              {/* Header */}
              <div className="text-center mb-40">
                <h4 className="mb-12">Register as a Seller</h4>
                <p className="text-gray-600">
                  Start selling your products on our platform
                </p>
              </div>

              {/* Step 1: Account Information */}
              {step === 1 && (
                <form>
                  <div className="row gy-24">
                    <div className="col-12">
                      <label className="form-label">Full Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="full_name"
                        className="common-input"
                        placeholder="Enter your full name"
                        value={accountData.full_name}
                        onChange={handleAccountChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Email Address <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        name="email"
                        className="common-input"
                        placeholder="Enter your email"
                        value={accountData.email}
                        onChange={handleAccountChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        name="phone"
                        className="common-input"
                        placeholder="Enter phone number (10-11 digits)"
                        value={accountData.phone}
                        onChange={handleAccountChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Password <span className="text-danger">*</span></label>
                      <div className="position-relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          className="common-input"
                          placeholder="Enter password"
                          value={accountData.password}
                          onChange={handleAccountChange}
                          required
                        />
                        <span
                          className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ${showPassword ? 'ph-eye' : 'ph-eye-slash'}`}
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </div>
                      <small className="text-gray-500 mt-1">
                        Min 8 characters, 1 uppercase, 1 lowercase, 1 number
                      </small>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
                      <input
                        type="password"
                        name="passwordConfirm"
                        className="common-input"
                        placeholder="Confirm your password"
                        value={accountData.passwordConfirm}
                        onChange={handleAccountChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <div className="alert alert-info">
                        <i className="ph ph-info me-8"></i>
                        Your seller account will be pending approval after registration.
                      </div>
                    </div>

                    <div className="col-12">
                      <button
                        type="button"
                        className="btn btn-main py-18 w-100"
                        onClick={handleNext}
                      >
                        Next: Business Information
                      </button>
                    </div>

                    <div className="col-12 text-center">
                      <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/auth" className="text-main-600 fw-semibold">
                          Login here
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              )}

              {/* Step 2: Business Information */}
              {step === 2 && (
                <form onSubmit={handleSubmit}>
                  <div className="row gy-24">
                    <div className="col-12">
                      <label className="form-label">Business Type <span className="text-danger">*</span></label>
                      <select
                        name="business_type"
                        className="common-input"
                        value={businessData.business_type}
                        onChange={handleBusinessChange}
                        required
                      >
                        <option value="individual">Individual/Freelancer</option>
                        <option value="company">Company/Enterprise</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Business Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="business_name"
                        className="common-input"
                        placeholder="Enter your business/store name"
                        value={businessData.business_name}
                        onChange={handleBusinessChange}
                        required
                      />
                    </div>

                    {businessData.business_type === 'company' && (
                      <div className="col-12">
                        <label className="form-label">Tax ID / Business License <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="tax_id"
                          className="common-input"
                          placeholder="Enter your tax ID or business license number"
                          value={businessData.tax_id}
                          onChange={handleBusinessChange}
                          required
                        />
                      </div>
                    )}

                    <div className="col-12">
                      <label className="form-label">Business Phone <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        name="business_phone"
                        className="common-input"
                        placeholder="Business contact number"
                        value={businessData.business_phone}
                        onChange={handleBusinessChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Business Address</label>
                      <textarea
                        name="business_address"
                        className="common-input"
                        rows="3"
                        placeholder="Enter your business address"
                        value={businessData.business_address}
                        onChange={handleBusinessChange}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <h6 className="mb-16">Payment Information (Optional)</h6>
                      <p className="text-sm text-gray-600 mb-24">
                        You can add this information later in your seller dashboard
                      </p>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Bank Name</label>
                      <input
                        type="text"
                        name="bank_name"
                        className="common-input"
                        placeholder="Name of your bank"
                        value={businessData.bank_name}
                        onChange={handleBusinessChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Bank Account Number</label>
                      <input
                        type="text"
                        name="bank_account"
                        className="common-input"
                        placeholder="Your bank account number"
                        value={businessData.bank_account}
                        onChange={handleBusinessChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Account Holder Name</label>
                      <input
                        type="text"
                        name="account_holder_name"
                        className="common-input"
                        placeholder="Name on bank account"
                        value={businessData.account_holder_name}
                        onChange={handleBusinessChange}
                      />
                    </div>

                    <div className="col-12">
                      <div className="alert alert-warning">
                        <i className="ph ph-warning me-8"></i>
                        <strong>Important:</strong> Your seller account will be reviewed by our team. 
                        You will be notified via email once approved.
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex gap-16">
                        <button
                          type="button"
                          className="btn btn-outline-main py-18 flex-grow-1"
                          onClick={handleBack}
                        >
                          <i className="ph ph-arrow-left me-8"></i>
                          Back
                        </button>
                        <button
                          type="submit"
                          className="btn btn-main py-18 flex-grow-1"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-8"></span>
                              Registering...
                            </>
                          ) : (
                            <>
                              <i className="ph ph-check-circle me-8"></i>
                              Complete Registration
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerRegistration;