import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.password || !formData.passwordConfirm) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password must be at least 8 characters with uppercase, lowercase and number');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(token, formData.password);
      
      if (response.success) {
        toast.success('Password reset successfully!');
        setTimeout(() => {
          navigate('/account');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="account py-80">
      <div className="container container-lg">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="border border-gray-100 rounded-16 px-24 py-40">
              <h6 className="text-xl mb-32">Reset Password</h6>

              <form onSubmit={handleSubmit}>
                <p className="text-gray-500 mb-32">
                  Please enter your new password.
                </p>

                {/* New Password */}
                <div className="mb-24">
                  <label
                    htmlFor="password"
                    className="text-neutral-900 text-lg mb-8 fw-medium"
                  >
                    New Password <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="common-input"
                      id="password"
                      name="password"
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <span
                      className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ${
                        showPassword ? 'ph-eye' : 'ph-eye-slash'
                      }`}
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <small className="text-gray-500">
                    Min 8 characters, 1 uppercase, 1 lowercase, 1 number
                  </small>
                </div>

                {/* Confirm Password */}
                <div className="mb-24">
                  <label
                    htmlFor="passwordConfirm"
                    className="text-neutral-900 text-lg mb-8 fw-medium"
                  >
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="common-input"
                    id="passwordConfirm"
                    name="passwordConfirm"
                    placeholder="Confirm your password"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-main w-100 py-18"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <div className="mt-32 text-center">
                  <Link to="/account" className="text-main-600">
                    ← Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;