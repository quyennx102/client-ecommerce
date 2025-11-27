// src/components/SellerRevenue.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import sellerRevenueService from '../../services/sellerRevenueService';
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

const SellerRevenue = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedStore, setSelectedStore] = useState('');
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchRevenueStats();
  }, [selectedStore, period]);

  const fetchRevenueStats = async (customParams = {}) => {
    setLoading(true);
    try {
      const params = {
        period,
        ...customParams
      };

      if (selectedStore) {
        params.store_id = selectedStore;
      }

      if (dateRange.start_date && dateRange.end_date) {
        params.start_date = dateRange.start_date;
        params.end_date = dateRange.end_date;
      }

      const response = await sellerRevenueService.getRevenue(params);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error('Failed to load revenue statistics');
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
      fetchRevenueStats(dateRange);
    } else {
      toast.warning('Please select both start and end dates');
    }
  };

  const clearDateFilter = () => {
    setDateRange({ start_date: '', end_date: '' });
    fetchRevenueStats({});
  };

  const handleExportReport = async () => {
    try {
      const params = {};
      if (selectedStore) params.store_id = selectedStore;
      if (dateRange.start_date && dateRange.end_date) {
        params.start_date = dateRange.start_date;
        params.end_date = dateRange.end_date;
      }

      const response = await sellerRevenueService.exportReport(params);
      
      if (response.success) {
        // Convert to CSV and download
        const csvContent = convertToCSV(response.data);
        downloadCSV(csvContent, `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success('Report exported successfully');
      }
    } catch (error) {
      toast.error('Failed to export report');
      console.error(error);
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => `"${row[header]}"`).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart colors
  const COLORS = ['#FA6400', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !stats) {
    return (
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center py-80">
            <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-16 text-gray-500">Loading revenue data...</p>
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
            <p className="text-gray-500">No revenue data available</p>
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
              <h4 className="mb-16">Revenue Dashboard</h4>
              
              {/* Filters */}
              <div className="row g-16 align-items-end">
                <div className="col-md-3">
                  <label className="form-label text-sm">Period</label>
                  <select
                    className="form-select"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label text-sm">Store</label>
                  <select
                    className="form-select"
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                  >
                    <option value="">All Stores</option>
                    {stats.stores?.map(store => (
                      <option key={store.store_id} value={store.store_id}>
                        {store.store_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label text-sm">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={dateRange.start_date}
                    onChange={handleDateRangeChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label text-sm">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={dateRange.end_date}
                    onChange={handleDateRangeChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-2">
                  <div className="d-flex gap-8">
                    {dateRange.start_date && dateRange.end_date ? (
                      <>
                        <button onClick={applyDateFilter} className="btn btn-main btn-sm flex-grow-1">
                          Apply
                        </button>
                        <button onClick={clearDateFilter} className="btn btn-outline-main btn-sm">
                          Clear
                        </button>
                      </>
                    ) : (
                      <button onClick={handleExportReport} className="btn btn-success btn-sm w-100">
                        <i className="ph ph-download-simple me-8"></i>
                        Export
                      </button>
                    )}
                  </div>
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
                <i className="ph ph-currency-dollar text-success text-2xl"></i>
                <span className="badge bg-success-50 text-success-600">Revenue</span>
              </div>
              <h3 className="mb-1 text-success">{formatCurrency(stats.overview.total_revenue)}</h3>
              <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
              {stats.overview.revenue_growth !== 0 && (
                <div className={`text-sm ${stats.overview.revenue_growth > 0 ? 'text-success' : 'text-danger'}`}>
                  <i className={`ph ${stats.overview.revenue_growth > 0 ? 'ph-trend-up' : 'ph-trend-down'} me-4`}></i>
                  {Math.abs(stats.overview.revenue_growth)}% vs previous period
                </div>
              )}
            </div>
          </div>

          <div className="col-md-3">
            <div className="border border-gray-200 rounded-16 p-24 hover-shadow transition-1">
              <div className="flex-between mb-16">
                <i className="ph ph-shopping-bag text-main-600 text-2xl"></i>
                <span className="badge bg-main-50 text-main-600">Orders</span>
              </div>
              <h3 className="mb-1">{stats.overview.total_orders}</h3>
              <p className="text-gray-600 text-sm mb-0">Total Orders</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border border-gray-200 rounded-16 p-24 hover-shadow transition-1">
              <div className="flex-between mb-16">
                <i className="ph ph-chart-line text-primary text-2xl"></i>
                <span className="badge bg-primary-50 text-primary-600">Average</span>
              </div>
              <h3 className="mb-1">{formatCurrency(stats.overview.average_order_value)}</h3>
              <p className="text-gray-600 text-sm mb-0">Avg Order Value</p>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border border-gray-200 rounded-16 p-24 hover-shadow transition-1">
              <div className="flex-between mb-16">
                <i className="ph ph-clock text-warning text-2xl"></i>
                <span className="badge bg-warning-50 text-warning-600">Pending</span>
              </div>
              <h3 className="mb-1 text-warning">{formatCurrency(stats.overview.pending_revenue)}</h3>
              <p className="text-gray-600 text-sm mb-0">Pending Revenue</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart & Orders Breakdown */}
        <div className="row g-4 mb-32">
          <div className="col-lg-8">
            <div className="border border-gray-200 rounded-16 p-24">
              <h5 className="mb-24">Revenue Trend</h5>
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
                    label={({ order_status, count }) => 
                      `${order_status}: ${count}`
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

        {/* Revenue by Store & Payment Methods */}
        {stats.revenue_by_store.length > 1 && (
          <div className="row g-4 mb-32">
            <div className="col-lg-6">
              <div className="border border-gray-200 rounded-16 p-24">
                <h5 className="mb-24">Revenue by Store</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.revenue_by_store}>
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
                    <Bar dataKey="revenue" fill="#FA6400" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="border border-gray-200 rounded-16 p-24">
                <h5 className="mb-24">Payment Methods</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.payment_methods}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="payment_method" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#00C49F" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Top Products & Recent Orders */}
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
                    {stats.top_products.slice(0, 10).map((product, index) => (
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
              <h5 className="mb-24">Recent High-Value Orders</h5>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th className="text-end">Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_orders.slice(0, 10).map((order) => (
                      <tr key={order.order_id}>
                        <td className="fw-semibold">#{order.order_id}</td>
                        <td>{order.customer?.full_name}</td>
                        <td className="text-end fw-semibold">
                          {formatCurrency(order.final_amount)}
                        </td>
                        <td>
                          <span className={`badge ${
                            order.payment_status === 'paid' ? 'bg-success' :
                            order.payment_status === 'failed' ? 'bg-danger' :
                            'bg-warning'
                          }`}>
                            {order.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerRevenue;