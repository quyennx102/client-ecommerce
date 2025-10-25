import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* ... other navbar items ... */}

        <div className="navbar-right">
          {user ? (
            <div className="dropdown">
              <button className="btn btn-link dropdown-toggle" data-bs-toggle="dropdown">
                <img 
                  src={user.avatar_url || '/default-avatar.png'} 
                  alt={user.full_name}
                  className="rounded-circle"
                  style={{ width: '32px', height: '32px' }}
                />
                <span className="ms-2">{user.full_name}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <i className="ph ph-user me-2"></i>
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/orders">
                    <i className="ph ph-shopping-bag me-2"></i>
                    My Orders
                  </Link>
                </li>
                {user.role === 'seller' && (
                  <li>
                    <Link className="dropdown-item" to="/seller/dashboard">
                      <i className="ph ph-storefront me-2"></i>
                      Seller Dashboard
                    </Link>
                  </li>
                )}
                {user.role === 'admin' && (
                  <li>
                    <Link className="dropdown-item" to="/admin/dashboard">
                      <i className="ph ph-gear me-2"></i>
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="ph ph-sign-out me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link to="/account" className="btn btn-main">
              <i className="ph ph-user me-2"></i>
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;