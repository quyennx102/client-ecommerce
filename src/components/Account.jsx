import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login: authLogin, isAuthenticated } = useAuth();

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

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

  // Validation errors
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [loginTouched, setLoginTouched] = useState({});
  const [registerTouched, setRegisterTouched] = useState({});

  // =============================================
  // HANDLE URL ERROR PARAMETERS
  // =============================================
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      let errorMessage = 'An error occurred';
      
      switch (error) {
        case 'facebook_login_failed':
          errorMessage = 'Facebook login failed. Please try again or use another method.';
          break;
        case 'google_login_failed':
          errorMessage = 'Google login failed. Please try again or use another method.';
          break;
        case 'social_login_failed':
          errorMessage = 'Social login failed. Please try again.';
          break;
        case 'email_already_exists':
          errorMessage = 'This email is already registered. Please login instead.';
          break;
        case 'account_suspended':
          errorMessage = 'Your account has been suspended. Please contact support.';
          break;
        default:
          errorMessage = 'An error occurred during authentication.';
      }
      
      toast.error(errorMessage);
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setLoginData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  // =============================================
  // VALIDATION FUNCTIONS
  // =============================================
  const validateLoginField = (name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email format';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateRegisterField = (name, value, allData = registerData) => {
    let error = '';

    switch (name) {
      case 'full_name':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          error = 'Name must not exceed 100 characters';
        } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
          error = 'Name can only contain letters and spaces';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email format';
        }
        break;

      case 'phone':
        if (value && value.trim().length > 0) {
          const digitsOnly = value.replace(/\D/g, '');
          if (digitsOnly.length < 10) {
            error = 'Phone number must be at least 10 digits';
          } else if (digitsOnly.length > 11) {
            error = 'Phone number must not exceed 11 digits';
          }
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = 'Password must contain uppercase, lowercase and number';
        }
        break;

      case 'passwordConfirm':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== allData.password) {
          error = 'Passwords do not match';
        }
        break;

      default:
        break;
    }

    return error;
  };

  // =============================================
  // LOGIN HANDLERS
  // =============================================
  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setLoginData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate on change if field was touched
    if (loginTouched[name] && type !== 'checkbox') {
      const error = validateLoginField(name, newValue);
      setLoginErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleLoginBlur = (e) => {
    const { name, value } = e.target;
    
    setLoginTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateLoginField(name, value);
    setLoginErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateLoginForm = () => {
    const newErrors = {};
    
    ['email', 'password'].forEach(field => {
      const error = validateLoginField(field, loginData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setLoginErrors(newErrors);
    setLoginTouched({ email: true, password: true });

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateLoginForm()) return;

    setLoginLoading(true);

    try {
      const result = await authLogin({
        email: loginData.email,
        password: loginData.password
      });

      if (result.success) {
        if (loginData.rememberMe) {
          localStorage.setItem('rememberEmail', loginData.email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        toast.success('Login successful!');
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

    // Validate on change if field was touched
    if (registerTouched[name]) {
      const error = validateRegisterField(name, value, { ...registerData, [name]: value });
      setRegisterErrors(prev => ({
        ...prev,
        [name]: error
      }));

      // Special case: validate passwordConfirm when password changes
      if (name === 'password' && registerTouched.passwordConfirm) {
        const confirmError = validateRegisterField('passwordConfirm', registerData.passwordConfirm, { ...registerData, [name]: value });
        setRegisterErrors(prev => ({
          ...prev,
          passwordConfirm: confirmError
        }));
      }
    }
  };

  const handleRegisterBlur = (e) => {
    const { name, value } = e.target;
    
    setRegisterTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateRegisterField(name, value);
    setRegisterErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateRegisterForm = () => {
    const newErrors = {};
    const requiredFields = ['full_name', 'email', 'password', 'passwordConfirm'];

    requiredFields.forEach(field => {
      const error = validateRegisterField(field, registerData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validate optional phone field if filled
    if (registerData.phone) {
      const phoneError = validateRegisterField('phone', registerData.phone);
      if (phoneError) {
        newErrors.phone = phoneError;
      }
    }

    setRegisterErrors(newErrors);
    setRegisterTouched(
      Object.keys(registerData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      
      // Focus on first error field
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) element.focus();
      
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateRegisterForm()) return;

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

              <form onSubmit={handleLogin} noValidate>
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
                    className={`common-input ${
                      loginTouched.email && loginErrors.email ? 'border-danger' : ''
                    }`}
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    onBlur={handleLoginBlur}
                  />
                  {loginTouched.email && loginErrors.email && (
                    <div className="text-danger text-sm mt-8">
                      <i className="ph ph-warning-circle me-4"></i>
                      {loginErrors.email}
                    </div>
                  )}
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
                      className={`common-input ${
                        loginTouched.password && loginErrors.password ? 'border-danger' : ''
                      }`}
                      id="password"
                      name="password"
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      onBlur={handleLoginBlur}
                    />
                    <span
                      className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ${
                        showLoginPassword ? 'ph-eye' : 'ph-eye-slash'
                      }`}
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  {loginTouched.password && loginErrors.password && (
                    <div className="text-danger text-sm mt-8">
                      <i className="ph ph-warning-circle me-4"></i>
                      {loginErrors.password}
                    </div>
                  )}
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

              <form onSubmit={handleRegister} noValidate>
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
                    className={`common-input ${
                      registerTouched.full_name && registerErrors.full_name ? 'border-danger' : ''
                    }`}
                    id="full_name"
                    name="full_name"
                    placeholder="Enter your full name"
                    value={registerData.full_name}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                  />
                  {registerTouched.full_name && registerErrors.full_name && (
                    <div className="text-danger text-sm mt-8">
                      <i className="ph ph-warning-circle me-4"></i>
                      {registerErrors.full_name}
                    </div>
                  )}
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
                    className={`common-input ${
                      registerTouched.email && registerErrors.email ? 'border-danger' : ''
                    }`}
                    id="emailRegister"
                    name="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                  />
                  {registerTouched.email && registerErrors.email && (
                    <div className="text-danger text-sm mt-8">
                      <i className="ph ph-warning-circle me-4"></i>
                      {registerErrors.email}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="mb-24">
                  <label
                    htmlFor="phone"
                    className="text-neutral-900 text-lg mb-8 fw-medium"
                  >
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    className={`common-input ${
                      registerTouched.phone && registerErrors.phone ? 'border-danger' : ''
                    }`}
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number (10-11 digits)"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                  />
                  {registerTouched.phone && registerErrors.phone && (
                    <div className="text-danger text-sm mt-8">
                      <i className="ph ph-warning-circle me-4"></i>
                      {registerErrors.phone}
                    </div>
                  )}
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
                      className={`common-input ${
                        registerTouched.password && registerErrors.password ? 'border-danger' : ''
                      }`}
                      id="passwordRegister"
                      name="password"
                      placeholder="Enter password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      onBlur={handleRegisterBlur}
                    />
                    <span
                      className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ${
                        showRegisterPassword ? 'ph-eye' : 'ph-eye-slash'
                      }`}
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  {registerTouched.password && registerErrors.password && (
                    <div className="text-danger text-sm mt-8">
                      <i className="ph ph-warning-circle me-4"></i>
                      {registerErrors.password}
                    </div>
                  )}
                  <small className="text-gray-500 mt-1 d-block">
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
                    className={`common-input ${
                      registerTouched.passwordConfirm && registerErrors.passwordConfirm ? 'border-danger' : ''
                    }`}
                    id="passwordConfirm"
                    name="passwordConfirm"
                    placeholder="Confirm your password"
                    value={registerData.passwordConfirm}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                  />
                  {registerTouched.passwordConfirm && registerErrors.passwordConfirm && (
                    <div className="text-danger text-sm mt-8">
                      <i className="ph ph-warning-circle me-4"></i>
                      {registerErrors.passwordConfirm}
                    </div>
                  )}
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