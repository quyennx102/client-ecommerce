import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, isAuthenticated } = useAuth(); // Sử dụng auth context

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Register state
  const [registerData, setRegisterData] = useState({
    full_name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // =============================================
  // LOGIN HANDLERS
  // =============================================
  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoginLoading(true);

    try {
      const result = await authLogin({
        email: loginData.email,
        password: loginData.password
      });

      if (result.success) {
        // Remember me
        if (loginData.rememberMe) {
          localStorage.setItem('rememberEmail', loginData.email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        toast.success('Login successful!');

        // Redirect sẽ được xử lý tự động bởi useEffect ở trên
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // =============================================
  // REGISTER HANDLERS
  // =============================================
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateRegisterForm = () => {
    if (!registerData.full_name || !registerData.email || !registerData.password) {
      toast.error('Please fill in all required fields');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      toast.error('Invalid email format');
      return false;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(registerData.password)) {
      toast.error('Password must be at least 8 characters with uppercase, lowercase and number');
      return false;
    }

    // Password confirmation
    if (registerData.password !== registerData.passwordConfirm) {
      toast.error('Passwords do not match');
      return false;
    }

    // Phone validation (optional)
    if (registerData.phone) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(registerData.phone)) {
        toast.error('Invalid phone number (10-11 digits)');
        return false;
      }
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateRegisterForm()) {
      return;
    }

    setRegisterLoading(true);

    try {
      const response = await authService.register({
        full_name: registerData.full_name,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone,
        role: 'user'
      });

      if (response.success) {
        toast.success('Registration successful! Welcome!');

        // Auto login after register
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirect to home
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  // =============================================
  // SOCIAL LOGIN HANDLERS
  // =============================================
  const handleFacebookLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/facebook`;
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  // =============================================
  // RENDER
  // =============================================
  return (
    <section className="account py-80">
      <div className="container container-lg">
        <div className="row gy-4">
          {/* ========================================= */}
          {/* LOGIN CARD */}
          {/* ========================================= */}
          <div className="col-xl-6 pe-xl-5">
            <div className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 h-100">
              <h6 className="text-xl mb-32">Login</h6>

              <form onSubmit={handleLogin}>
                {/* Email */}
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
                    name="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                  />
                </div>

                {/* Password */}
                <div className="mb-24">
                  <label
                    htmlFor="password"
                    className="text-neutral-900 text-lg mb-8 fw-medium"
                  >
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      className="common-input"
                      id="password"
                      name="password"
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                    <span
                      className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ${showLoginPassword ? 'ph-eye' : 'ph-eye-slash'
                        }`}
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>

                {/* Remember & Submit */}
                <div className="mb-24 mt-48">
                  <div className="flex-align gap-48 flex-wrap">
                    <button
                      type="submit"
                      className="btn btn-main py-18 px-40"
                      disabled={loginLoading}
                    >
                      {loginLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Logging in...
                        </>
                      ) : (
                        'Log in'
                      )}
                    </button>
                    <div className="form-check common-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="rememberMe"
                        id="remember"
                        checked={loginData.rememberMe}
                        onChange={handleLoginChange}
                      />
                      <label
                        className="form-check-label flex-grow-1"
                        htmlFor="remember"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="mt-24 mb-32">
                  <Link
                    to="/auth/forgot-password"
                    className="text-danger-600 text-sm fw-semibold hover-text-decoration-underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>

              {/* Social Login */}
              <div className="mt-32">
                <div className="position-relative">
                  <hr className="text-gray-100" />
                  <span
                    className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-gray-500"
                    style={{ fontSize: '14px' }}
                  >
                    Or login with
                  </span>
                </div>

                <div className="mt-32 d-flex gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-main w-100 py-12"
                    onClick={handleFacebookLogin}
                  >
                    <i className="ph ph-facebook-logo me-2"></i>
                    Facebook
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-main w-100 py-12"
                    onClick={handleGoogleLogin}
                  >
                    <i className="ph ph-google-logo me-2"></i>
                    Google
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* REGISTER CARD */}
          {/* ========================================= */}
          <div className="col-xl-6">
            <div className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40">
              <h6 className="text-xl mb-32">Register</h6>

              <form onSubmit={handleRegister}>
                {/* Full Name */}
                <div className="mb-24">
                  <label
                    htmlFor="full_name"
                    className="text-neutral-900 text-lg mb-8 fw-medium"
                  >
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="common-input"
                    id="full_name"
                    name="full_name"
                    placeholder="Enter your full name"
                    value={registerData.full_name}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="mb-24">
                  <label
                    htmlFor="emailRegister"
                    className="text-neutral-900 text-lg mb-8 fw-medium"
                  >
                    Email address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="common-input"
                    id="emailRegister"
                    name="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="mb-24">
                  <label
                    htmlFor="phone"
                    className="text-neutral-900 text-lg mb-8 fw-medium"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="common-input"
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number (10-11 digits)"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                  />
                </div>

                {/* Password */}
                <div className="mb-24">
                  <label
                    htmlFor="passwordRegister"
                    className="text-neutral-900 text-lg mb-8 fw-medium"
                  >
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      className="common-input"
                      id="passwordRegister"
                      name="password"
                      placeholder="Enter password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                    />
                    <span
                      className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ${showRegisterPassword ? 'ph-eye' : 'ph-eye-slash'
                        }`}
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <small className="text-gray-500 mt-1">
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
                    value={registerData.passwordConfirm}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                {/* Privacy Policy */}
                <div className="my-32">
                  <p className="text-gray-500 text-sm">
                    Your personal data will be used to process your order, support
                    your experience throughout this website, and for other purposes
                    described in our
                    <Link to="/privacy-policy" className="text-main-600 text-decoration-underline">
                      {" "}privacy policy
                    </Link>.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="mt-32">
                  <button
                    type="submit"
                    className="btn btn-main py-18 px-40 w-100"
                    disabled={registerLoading}
                  >
                    {registerLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>

              {/* Social Register */}
              <div className="mt-32">
                <div className="position-relative">
                  <hr className="text-gray-100" />
                  <span
                    className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-gray-500"
                    style={{ fontSize: '14px' }}
                  >
                    Or register with
                  </span>
                </div>

                <div className="mt-32 d-flex gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-main w-100 py-12"
                    onClick={handleFacebookLogin}
                  >
                    <i className="ph ph-facebook-logo me-2"></i>
                    Facebook
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-main w-100 py-12"
                    onClick={handleGoogleLogin}
                  >
                    <i className="ph ph-google-logo me-2"></i>
                    Google
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Account;