import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SellerDashboard = () => {
  const { user } = useAuth();

  return (
    <section className="py-80">
      <div className="container container-lg">
        <div className="row">
          <div className="col-12">
            <div className="bg-warning bg-opacity-10 border border-warning rounded-16 p-24 mb-32">
              <h4 className="mb-2">Seller Dashboard</h4>
              <p className="text-gray-600 mb-0">Welcome to your seller center, {user?.full_name}!</p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="border border-gray-200 rounded-16 p-24 text-center hover-shadow transition-1">
              <i className="ph ph-storefront text-warning text-xl mb-3"></i>
              <h5 className="mb-2">My Stores</h5>
              <p className="text-gray-600 mb-0">Manage your stores</p>
              <Link to="/seller/stores" className="btn btn-warning btn-sm mt-3">
                Manage Stores
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="border border-gray-200 rounded-16 p-24 text-center hover-shadow transition-1">
              <i className="ph ph-package text-success text-xl mb-3"></i>
              <h5 className="mb-2">Products</h5>
              <p className="text-gray-600 mb-0">Manage your products</p>
              <Link to="/seller/stores" className="btn btn-main btn-sm mt-3">
                View Products
              </Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="border border-gray-200 rounded-16 p-24 text-center hover-shadow transition-1">
              <i className="ph ph-chart-line text-primary text-xl mb-3"></i>
              <h5 className="mb-2">Analytics</h5>
              <p className="text-gray-600 mb-0">View sales analytics</p>
              <button className="btn btn-outline-main btn-sm mt-3">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerDashboard;