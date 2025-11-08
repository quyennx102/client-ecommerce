import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext'; // Thêm import

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth(); // Sử dụng AuthContext

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Social login failed. Please try again.');
      navigate('/auth');
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
            const userData = data.data;
            localStorage.setItem('user', JSON.stringify(userData));
            
            // QUAN TRỌNG: Cập nhật AuthContext
            updateUser(userData);
            
            toast.success('Login successful!');
            navigate('/');
          } else {
            toast.error('Failed to fetch user data');
            navigate('/auth');
          }
        })
        .catch(error => {
          toast.error('An error occurred');
          navigate('/auth');
        });
    } else {
      navigate('/auth');
    }
  }, [searchParams, navigate, updateUser]); // Thêm updateUser vào dependencies

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