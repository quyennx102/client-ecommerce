import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Social login failed. Please try again.');
      navigate('/account');
      return;
    }

    if (token) {
      // Save token
      localStorage.setItem('token', token);

      // Fetch user data
      fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.data));
            toast.success('Login successful!');
            navigate('/');
          } else {
            toast.error('Failed to fetch user data');
            navigate('/account');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          toast.error('An error occurred');
          navigate('/account');
        });
    } else {
      navigate('/account');
    }
  }, [searchParams, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Processing login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;