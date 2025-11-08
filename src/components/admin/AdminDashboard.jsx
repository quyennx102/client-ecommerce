import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <section className="py-80">
      <div className="container container-lg">
        <div className="row">
          <div className="col-12">
            <div className="bg-main-50 border border-main-200 rounded-16 p-24 mb-32">
              <h4 className="mb-2">Admin Dashboard</h4>
              <p className="text-gray-600 mb-0">Welcome back, {user?.full_name}!</p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Quick Stats */}
          <div className="col-md-3">
            <div className="border border-gray-200 rounded-16 p-24 text-center hover-shadow transition-1">
              <i className="ph ph-users text-primary text-xl mb-3"></i>
              <h5 className="mb-2">Users</h5>
              <p className="text-gray-600 mb-0">Manage all users</p>
              <Link to="/admin/users" className="btn btn-main btn-sm mt-3">
                Manage
              </Link>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border border-gray-200 rounded-16 p-24 text-center hover-shadow transition-1">
              <i className="ph ph-package text-success text-xl mb-3"></i>
              <h5 className="mb-2">Products</h5>
              <p className="text-gray-600 mb-0">Manage all products</p>
              <Link to="/admin/products" className="btn btn-main btn-sm mt-3">
                Manage
              </Link>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border border-gray-200 rounded-16 p-24 text-center hover-shadow transition-1">
              <i className="ph ph-tag text-warning text-xl mb-3"></i>
              <h5 className="mb-2">Categories</h5>
              <p className="text-gray-600 mb-0">Manage categories</p>
              <Link to="/admin/category" className="btn btn-main btn-sm mt-3">
                Manage
              </Link>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border border-gray-200 rounded-16 p-24 text-center hover-shadow transition-1">
              <i className="ph ph-storefront text-info text-xl mb-3"></i>
              <h5 className="mb-2">Stores</h5>
              <p className="text-gray-600 mb-0">Manage stores</p>
              <button className="btn btn-main btn-sm mt-3">
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;