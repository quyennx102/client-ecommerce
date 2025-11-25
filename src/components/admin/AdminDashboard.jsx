import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async (params = {}) => {
    setLoading(true);
    try {
      const response = await adminService.getDashboardStats(params);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const applyDateFilter = () => {
    if (dateRange.start_date && dateRange.end_date) {
      fetchDashboardStats(dateRange);
    } else {
      toast.warning('Please select both start and end dates');
    }
  };

  const clearDateFilter = () => {
    setDateRange({ start_date: '', end_date: '' });
    fetchDashboardStats();
  };

  // Chart colors
  const COLORS = ['#FA6400', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center py-80">
            <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-16 text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center py-80">
            <p className="text-gray-500">No data available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-80">
      <div className="container container-lg">
        {/* Header */}
        <div className="row mb-32">
          <div className="col-12">
            <div className="bg-main-50 border border-main-200 rounded-16 p-24">
              <div className="flex-between flex-wrap gap-16">
                <div>
                  <h4 className="mb-2">Admin Dashboard</h4>
                  <p className="text-gray-600 mb-0">Welcome back, {user?.full_name}!</p>
                </div>
                
                {/* Date Range Filter */}
                <div className="flex-align gap-8">
                  <input
                    type="date"
                    name="start_date"
                    value={dateRange.start_date}
                    onChange={handleDateRangeChange}
                    className="form-control"
                    style={{ width: 'auto' }}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    name="end_date"
                    value={dateRange.end_date}
                    onChange={handleDateRangeChange}
                    className="form-control"
                    style={{ width: 'auto' }}
                  />
                  <button onClick={applyDateFilter} className="btn btn-main">
                    Apply
                  </button>
                  {(dateRange.start_date || dateRange.end_date) && (
                    <button onClick={clearDateFilter} className="btn btn-outline-main">
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="row g-4 mb-32">
          <div className="col-md-3">
            <div className="border border-gray-200 rounded-16 p-24 hover-shadow transition-1">
              <div className="flex-between mb-16">
                <i className="ph ph-users text-primary text-xl"></i>
                <span className="badge bg-primary-50 text-primary-600">Users</span>
              </div>
              <h3 className="mb-1">{stats.overview.total_users}</h3>
              <p className="text-gray-600 text-sm mb-0">Total Users</p>
              <div className="mt-2">
                <span className="text-xs text-gray-500">
                  Sellers: {stats.overview.total_sellers}
                </span>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border border-gray-200 rounded-16 p-24 hover-shadow transition-1">
              <div className="flex-between mb-16">
                <i className="ph ph-package text-success text-xl"></i>
                <span className="badge bg-success-50 text-success-600">Products</span>
              </div>
              <h3 className="mb-1">{stats.overview.total_products}</h3>
              <p className="text-gray-600 text-sm mb-0">Active Products</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border border-gray-200 rounded-16 p-24 hover-shadow transition-1">
              <div className="flex-between mb-16">
                <i className="ph ph-shopping-bag text-warning text-xl"></i>
                <span className="badge bg-warning-50 text-warning-600">Orders</span>
              </div>
              <h3 className="mb-1">{stats.overview.total_orders}</h3>
              <p className="text-gray-600 text-sm mb-0">Total Orders</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border border-gray-200 rounded-16 p-24 hover-shadow transition-1 bg-main-50">
              <div className="flex-between mb-16">
                <i className="ph ph-currency-dollar text-main-600 text-xl"></i>
                <span className="badge bg-main-600 text-white">Revenue</span>
              </div>
              <h3 className="mb-1 text-main-600">
                {formatCurrency(stats.overview.total_revenue)}
              </h3>
              <p className="text-gray-600 text-sm mb-0">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="row g-4 mb-32">
          <div className="col-lg-8">
            <div className="border border-gray-200 rounded-16 p-24">
              <h5 className="mb-24">Revenue Trend (Last 30 Days)</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.revenue_by_day}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={formatDate}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#FA6400" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="border border-gray-200 rounded-16 p-24">
              <h5 className="mb-24">Orders by Status</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.orders_by_status}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ order_status, percent }) => 
                      `${order_status}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="order_status"
                  >
                    {stats.orders_by_status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="row g-4 mb-32">
          <div className="col-lg-6">
            <div className="border border-gray-200 rounded-16 p-24">
              <h5 className="mb-24">Top Selling Products</h5>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-end">Sold</th>
                      <th className="text-end">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.top_products.map((product, index) => (
                      <tr key={index}>
                        <td>
                          <div className="flex-align gap-8">
                            <span className="badge bg-main-50 text-main-600">#{index + 1}</span>
                            <span className="text-sm">{product.product_name}</span>
                          </div>
                        </td>
                        <td className="text-end fw-semibold">{product.total_sold}</td>
                        <td className="text-end text-success fw-semibold">
                          {formatCurrency(product.total_revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="border border-gray-200 rounded-16 p-24">
              <h5 className="mb-24">Top Stores by Revenue</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.top_stores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="store.store_name" 
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="total_revenue" fill="#FA6400" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="row g-4 mb-32">
          <div className="col-12">
            <div className="border border-gray-200 rounded-16 p-24">
              <div className="flex-between mb-24">
                <h5 className="mb-0">Recent Orders</h5>
                <Link to="/admin/orders" className="btn btn-outline-main btn-sm">
                  View All
                </Link>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Store</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_orders.map((order) => (
                      <tr key={order.order_id}>
                        <td className="fw-semibold">#{order.order_id}</td>
                        <td>{order.customer.full_name}</td>
                        <td>{order.store.store_name}</td>
                        <td className="fw-semibold">{formatCurrency(order.final_amount)}</td>
                        <td>
                          <span className={`badge ${
                            order.order_status === 'delivered' ? 'bg-success' :
                            order.order_status === 'cancelled' ? 'bg-danger' :
                            order.order_status === 'processing' ? 'bg-warning' :
                            'bg-secondary'
                          }`}>
                            {order.order_status}
                          </span>
                        </td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="row g-4">
          <div className="col-md-3">
            <Link to="/admin/users" className="border border-gray-200 rounded-16 p-24 text-center hover-shadow transition-1 d-block text-decoration-none">
              <i className="ph ph-users text-primary text-xl mb-3"></i>
              <h6 className="mb-2">Manage Users</h6>
              <p className="text-gray-600 text-sm mb-0">View and manage all users</p>
            </Link>
          </div>

          <div className="col-md-3">
            <Link to="/admin/products" className="border border-gray-200 rounded-16 p-24 text-center hover-shadow transition-1 d-block text-decoration-none">
              <i className="ph ph-package text-success text-xl mb-3"></i>
              <h6 className="mb-2">Manage Products</h6>
              <p className="text-gray-600 text-sm mb-0">View and manage all products</p>
            </Link>
          </div>

          <div className="col-md-3">
            <Link to="/admin/category" className="border border-gray-200 rounded-16 p-24 text-center hover-shadow transition-1 d-block text-decoration-none">
              <i className="ph ph-tag text-warning text-xl mb-3"></i>
              <h6 className="mb-2">Categories</h6>
              <p className="text-gray-600 text-sm mb-0">Manage product categories</p>
            </Link>
          </div>

          <div className="col-md-3">
            <Link to="/admin/stores" className="border border-gray-200 rounded-16 p-24 text-center hover-shadow transition-1 d-block text-decoration-none">
              <i className="ph ph-storefront text-info text-xl mb-3"></i>
              <h6 className="mb-2">Stores</h6>
              <p className="text-gray-600 text-sm mb-0">Manage all stores</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;