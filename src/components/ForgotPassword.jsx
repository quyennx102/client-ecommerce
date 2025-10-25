import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSent(true);
        toast.success('Password reset link sent to your email!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
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
              <h6 className="text-xl mb-32">Forgot Password</h6>

              {!sent ? (
                <form onSubmit={handleSubmit}>
                  <p className="text-gray-500 mb-32">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  <div className="mb-24">
                    <label
                      htmlFor="email"
                      className="text-neutral-900 text-lg mb-8 fw-medium"
                    >
                      Email address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="common-input"
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  <div className="mt-32 text-center">
                    <Link to="/account" className="text-main-600">
                      ← Back to Login
                    </Link>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <div className="mb-32">
                    <i className="ph ph-check-circle text-success" style={{ fontSize: '64px' }}></i>
                  </div>
                  <h5 className="mb-16">Check Your Email</h5>
                  <p className="text-gray-500 mb-32">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <Link to="/account" className="btn btn-main px-40">
                    Back to Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;