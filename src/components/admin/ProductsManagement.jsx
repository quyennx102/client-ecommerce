// =============================================
// 3. ADMIN - QUẢN LÝ TẤT CẢ SẢN PHẨM
// src/pages/admin/ProductsManagement.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import storeService from '../../services/storeService';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    category_id: '',
    store_id: '',
    search: '',
    min_price: '',
    max_price: '',
    stock_status: '', // 'low_stock', 'out_of_stock'
    sort_by: 'created_at',
    order: 'DESC'
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, storesRes] = await Promise.all([
        categoryService.getCategories({ status: 'active' }),
        storeService.getStores({ status: 'active', limit: 1000 })
      ]);

      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (storesRes.success) setStores(storesRes.data);
    } catch (error) {
      console.error('Failed to load initial data');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts(filters);
      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination);

        // Calculate stats
        calculateStats(response.data);
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productsData) => {
    const stats = {
      total: productsData.length,
      active: productsData.filter(p => p.status === 'active').length,
      inactive: productsData.filter(p => p.status === 'inactive').length,
      outOfStock: productsData.filter(p => p.stock_quantity === 0).length,
      lowStock: productsData.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length,
      totalValue: productsData.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock_quantity), 0)
    };
    setStats(stats);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.product_id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedProducts.length === 0) {
      toast.warning('Please select products');
      return;
    }

    if (!window.confirm(`Update ${selectedProducts.length} products to ${newStatus}?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map(id =>
          productService.updateProduct(id, { status: newStatus })
        )
      );
      toast.success('Products updated successfully');
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update products');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.warning('Please select products');
      return;
    }

    if (!window.confirm(`Delete ${selectedProducts.length} products? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map(id => productService.deleteProduct(id))
      );
      toast.success('Products deleted successfully');
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete products');
    }
  };

  const exportToCSV = () => {
    // Simple CSV export
    const headers = ['ID', 'Name', 'Category', 'Store', 'Price', 'Stock', 'Sold', 'Status'];
    const rows = products.map(p => [
      p.product_id,
      p.product_name,
      p.category?.category_name || '',
      p.store?.store_name || '',
      p.price,
      p.stock_quantity,
      p.sold_quantity || 0,
      p.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      status: '',
      category_id: '',
      store_id: '',
      search: '',
      min_price: '',
      max_price: '',
      stock_status: '',
      sort_by: 'created_at',
      order: 'DESC'
    });
  };

  return (
    <section className="py-80">
      <div className="container-fluid">
        {/* Header */}
        <div className="mb-32">
          <div className="flex-between flex-wrap gap-16 mb-24">
            <div>
              <h4 className="mb-8">Products Management</h4>
              <p className="text-gray-500 mb-0">Manage all products across the platform</p>
            </div>
            <div className="flex-align gap-16">
              <button className="btn btn-outline-main" onClick={exportToCSV}>
                <i className="ph ph-download-simple me-8"></i>
                Export CSV
              </button>
              <button
                className="btn btn-outline-main"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="ph ph-funnel me-8"></i>
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="row g-20 mb-24">
              <div className="col-lg-2 col-md-4 col-sm-6">
                <div className="border border-gray-100 rounded-16 p-20 bg-main-50">
                  <div className="text-2xl fw-bold text-main-600 mb-4">
                    {pagination?.totalItems?.[0]?.count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
              </div>
              <div className="col-lg-2 col-md-4 col-sm-6">
                <div className="border border-gray-100 rounded-16 p-20 bg-success-50">
                  <div className="text-2xl fw-bold text-success mb-4">{stats.active}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
              </div>
              <div className="col-lg-2 col-md-4 col-sm-6">
                <div className="border border-gray-100 rounded-16 p-20 bg-danger-50">
                  <div className="text-2xl fw-bold text-danger mb-4">{stats.outOfStock}</div>
                  <div className="text-sm text-gray-600">Out of Stock</div>
                </div>
              </div>
              <div className="col-lg-2 col-md-4 col-sm-6">
                <div className="border border-gray-100 rounded-16 p-20 bg-warning-50">
                  <div className="text-2xl fw-bold text-warning mb-4">{stats.lowStock}</div>
                  <div className="text-sm text-gray-600">Low Stock</div>
                </div>
              </div>
              <div className="col-lg-4 col-md-8">
                <div className="border border-gray-100 rounded-16 p-20">
                  <div className="text-2xl fw-bold text-main-600 mb-4">
                    {stats.totalValue.toLocaleString('vi-VN')}đ
                  </div>
                  <div className="text-sm text-gray-600">Total Inventory Value</div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border border-gray-100 rounded-16 p-24 mb-24">
              <div className="row g-16">
                <div className="col-lg-3">
                  <label className="text-sm mb-8">Search</label>
                  <input
                    type="text"
                    className="common-input"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
                <div className="col-lg-2">
                  <label className="text-sm mb-8">Status</label>
                  <select
                    className="common-input"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div className="col-lg-2">
                  <label className="text-sm mb-8">Category</label>
                  <select
                    className="common-input"
                    value={filters.category_id}
                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-3">
                  <label className="text-sm mb-8">Store</label>
                  <select
                    className="common-input"
                    value={filters.store_id}
                    onChange={(e) => handleFilterChange('store_id', e.target.value)}
                  >
                    <option value="">All Stores</option>
                    {stores.map(store => (
                      <option key={store.store_id} value={store.store_id}>
                        {store.store_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-2">
                  <label className="text-sm mb-8">Stock Status</label>
                  <select
                    className="common-input"
                    value={filters.stock_status}
                    onChange={(e) => handleFilterChange('stock_status', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="low_stock">Low Stock (&lt;10)</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div className="col-lg-2">
                  <label className="text-sm mb-8">Min Price</label>
                  <input
                    type="number"
                    className="common-input"
                    placeholder="0"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  />
                </div>
                <div className="col-lg-2">
                  <label className="text-sm mb-8">Max Price</label>
                  <input
                    type="number"
                    className="common-input"
                    placeholder="999999999"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  />
                </div>
                <div className="col-lg-3">
                  <label className="text-sm mb-8">Sort By</label>
                  <select
                    className="common-input"
                    value={`${filters.sort_by}_${filters.order}`}
                    onChange={(e) => {
                      const [sort_by, order] = e.target.value.split('_');
                      setFilters(prev => ({ ...prev, sort_by, order }));
                    }}
                  >
                    <option value="created_at_DESC">Newest First</option>
                    <option value="created_at_ASC">Oldest First</option>
                    <option value="product_name_ASC">Name: A-Z</option>
                    <option value="price_ASC">Price: Low-High</option>
                    <option value="price_DESC">Price: High-Low</option>
                    <option value="stock_quantity_ASC">Stock: Low-High</option>
                    <option value="sold_quantity_DESC">Most Sold</option>
                  </select>
                </div>
                <div className="col-lg-2 d-flex align-items-end">
                  <button
                    className="btn btn-outline-main w-100"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="border border-main-600 rounded-16 p-20 mb-24 bg-main-50">
            <div className="flex-between flex-wrap gap-16">
              <span className="fw-bold">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex-align gap-8">
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleBulkStatusUpdate('active')}
                >
                  <i className="ph ph-check-circle me-8"></i>
                  Set Active
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleBulkStatusUpdate('inactive')}
                >
                  <i className="ph ph-x-circle me-8"></i>
                  Set Inactive
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={handleBulkDelete}
                >
                  <i className="ph ph-trash me-8"></i>
                  Delete
                </button>
                <button
                  className="btn btn-sm btn-outline-main"
                  onClick={() => setSelectedProducts([])}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="border border-gray-100 rounded-16 overflow-hidden">
          {loading ? (
            <div className="text-center py-80">
              <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
              <p className="mt-16 text-gray-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-80">
              <i className="ph ph-package text-gray-300" style={{ fontSize: '80px' }}></i>
              <h5 className="mt-24 mb-16">No Products Found</h5>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="text-center" style={{ width: '100px' }}>ID</th>
                      <th className="text-center" style={{ width: '130px' }}>Image</th>
                      <th className="text-center">Product</th>
                      <th className="text-center" style={{ width: '150px' }}>Store</th>
                      <th className="text-center" style={{ width: '160px' }}>Category</th>
                      <th className="text-center" style={{ width: '120px' }}>Price</th>
                      <th className="text-center" style={{ width: '120px' }}>Stock</th>
                      <th className="text-center" style={{ width: '120px' }}>Sold</th>
                      <th className="text-center" style={{ width: '130px' }}>Status</th>
                      <th className="text-center" style={{ width: '130px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.product_id}>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.product_id)}
                            onChange={() => handleSelectProduct(product.product_id)}
                          />
                        </td>
                        <td className="text-gray-500">#{product.product_id}</td>
                        <td>
                          <img
                            src={product.images?.[0]?.image_url ? `${process.env.REACT_APP_IMAGE_URL}${product.images[0].image_url}` : '/placeholder.jpg'}
                            alt={product.product_name}
                            className="rounded-8"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        </td>
                        <td>
                          <div className="fw-medium text-line-2">{product.product_name}</div>
                        </td>
                        <td>
                          <div className="text-sm">{product.store?.store_name}</div>
                        </td>
                        <td>
                          <span className="badge bg-gray-200 text-dark">
                            {product.category?.category_name}
                          </span>
                        </td>
                        <td className="fw-bold">{parseInt(product.price).toLocaleString('vi-VN')}$</td>
                        <td>
                          <span className={
                            product.stock_quantity === 0 ? 'text-danger fw-bold' :
                              product.stock_quantity < 10 ? 'text-warning fw-bold' : ''
                          }>
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td>{product.sold_quantity || 0}</td>
                        <td>
                          <span className={`badge ${product.status === 'active' ? 'bg-success' :
                              product.status === 'out_of_stock' ? 'bg-danger' : 'bg-secondary'
                            }`}>
                            {product.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="flex-align gap-4">
                            <Link
                              to={`/products/${product.product_id}`}
                              className="btn btn-sm btn-outline-main"
                              title="View"
                              target="_blank"
                            >
                              <i className="ph ph-eye"></i>
                            </Link>
                            <Link
                              to={`/admin/products/${product.product_id}/edit`}
                              className="btn btn-sm btn-outline-main"
                              title="Edit"
                            >
                              <i className="ph ph-pencil"></i>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="border-top border-gray-100 p-24">
                  <div className="flex-between">
                    <div className="text-sm text-gray-500">
                      Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                      {Math.min(pagination.currentPage * filters.limit, pagination?.totalItems?.[0]?.count)} of{' '}
                      {pagination?.totalItems?.[0]?.count} products
                    </div>
                    <nav>
                      <ul className="pagination mb-0">
                        <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                          >
                            Previous
                          </button>
                        </li>
                        {[...Array(Math.min(10, pagination.totalPages))].map((_, i) => {
                          const page = i + 1;
                          return (
                            <li
                              key={page}
                              className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handleFilterChange('page', page)}
                              >
                                {page}
                              </button>
                            </li>
                          );
                        })}
                        <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsManagement;