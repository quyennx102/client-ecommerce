// =============================================
// 2. SELLER - QUẢN LÝ SẢN PHẨM
// src/pages/seller/ManageProducts.jsx
// =============================================
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import storeService from '../../services/storeService';
import sweetAlert from '../../utils/sweetAlert';
import "./ManageProducts.css"
const ManageProducts = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: '',
        search: '',
        sort_by: 'created_at',
        order: 'DESC'
    });

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [bulkAction, setBulkAction] = useState('');

    useEffect(() => {
        fetchStore();
    }, [storeId]);

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchStore = async () => {
        try {
            const response = await storeService.getStoreById(storeId);
            if (response.success) {
                setStore(response.data);
            }
        } catch (error) {
            toast.error('Failed to load store');
            navigate('/seller/stores');
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await storeService.getStoreProducts(storeId, filters);
            if (response.success) {
                setProducts(response.data.products);
                setPagination(response.pagination);
            }
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
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

    const handleBulkAction = async () => {
        if (!bulkAction) {
            toast.warning('Please select an action');
            return;
        }

        if (selectedProducts.length === 0) {
            toast.warning('Please select products');
            return;
        }

        const result = await sweetAlert.confirmBulkDelete(selectedProducts.length);
        if (!result.isConfirmed) {
            return;
        }

        try {
            if (bulkAction === 'delete') {
                await Promise.all(
                    selectedProducts.map(id => productService.deleteProduct(id))
                );
                toast.success('Products deleted successfully');
            }
            setSelectedProducts([]);
            setBulkAction('');
            fetchProducts();
        } catch (error) {
            toast.error('Bulk action failed');
            await sweetAlert.error('Error!', 'Failed to delete products. Please try again.');
        }
    };

    const handleDeleteProduct = async (productId) => {
        const product = products.find(p => p.product_id === productId);
        const productName = product?.product_name || 'This product';

        const result = await sweetAlert.confirmDelete(productName);
        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await productService.deleteProduct(productId);
            if (response.success) {
                toast.success('Product deleted successfully');
                fetchProducts();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete product';
            toast.error(errorMessage);
            await sweetAlert.error('Error!', errorMessage);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'active': 'bg-success',
            'inactive': 'bg-secondary',
            'out_of_stock': 'bg-danger'
        };
        return badges[status] || 'bg-secondary';
    };

    const getStatusText = (status) => {
        const statusMap = {
            'active': 'Active',
            'inactive': 'Inactive',
            'out_of_stock': 'Out of Stock'
        };
        return statusMap[status] || status;
    };

    const resetFilters = () => {
        setFilters({
            page: 1,
            limit: 10,
            status: '',
            search: '',
            sort_by: 'created_at',
            order: 'DESC'
        });
    };

    return (
        <section className="py-80">
            <div className="container container-lg">
                {/* Header */}
                <div className="mb-32">
                    <div className="flex-between flex-wrap gap-16 mb-24">
                        <div>
                            <h4 className="mb-8">Manage Products</h4>
                            {store && (
                                <p className="text-gray-500 mb-0">
                                    <i className="ph ph-storefront me-8"></i>
                                    {store.store_name}
                                </p>
                            )}
                        </div>
                        <div className="flex-align gap-16">
                            <button
                                className="btn btn-outline-main"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <i className={`ph ph-${showFilters ? 'funnel-simple-x' : 'funnel-simple'} me-8`}></i>
                                {showFilters ? 'Hide' : 'Show'} Filters
                            </button>
                            <Link
                                to={`/seller/stores/${storeId}/products/create`}
                                className="btn btn-main py-12 px-32"
                            >
                                <i className="ph ph-plus me-8"></i>
                                Add New Product
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {pagination && (
                        <div className="row g-3 mb-24">
                            <div className="col-xl-3 col-md-6">
                                <div className="border border-gray-100 rounded-12 p-16 text-center bg-white hover-shadow transition-1">
                                    <div className="text-xl fw-bold text-main-600 mb-2">
                                        {pagination.totalItems || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Products</div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="border border-gray-100 rounded-12 p-16 text-center bg-white hover-shadow transition-1">
                                    <div className="text-xl fw-bold text-success mb-2">
                                        {products.filter(p => p.status === 'active').length}
                                    </div>
                                    <div className="text-sm text-gray-600">Active</div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="border border-gray-100 rounded-12 p-16 text-center bg-white hover-shadow transition-1">
                                    <div className="text-xl fw-bold text-danger mb-2">
                                        {products.filter(p => p.stock_quantity === 0).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Out of Stock</div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="border border-gray-100 rounded-12 p-16 text-center bg-white hover-shadow transition-1">
                                    <div className="text-sm text-gray-600 mb-2">Showing {products.length} products</div>
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div
                                            className="progress-bar bg-main-600"
                                            style={{ width: `${(products.length / (pagination.totalItems || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters Bar */}
                    {showFilters && (
                        <div className="border border-gray-100 rounded-16 p-24 mb-24 bg-white">
                            <div className="row g-3">
                                <div className="col-lg-4">
                                    <input
                                        type="text"
                                        className="common-input"
                                        placeholder="Search products..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                                <div className="col-lg-3">
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
                                <div className="col-lg-3">
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
                                        <option value="product_name_ASC">Name: A to Z</option>
                                        <option value="product_name_DESC">Name: Z to A</option>
                                        <option value="price_ASC">Price: Low to High</option>
                                        <option value="price_DESC">Price: High to Low</option>
                                        <option value="stock_quantity_ASC">Stock: Low to High</option>
                                        <option value="sold_quantity_DESC">Most Sold</option>
                                    </select>
                                </div>
                                <div className="col-lg-2">
                                    <button
                                        className="btn btn-outline-main w-100"
                                        onClick={resetFilters}
                                    >
                                        <i className="ph ph-x me-8"></i>
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bulk Actions */}
                {selectedProducts.length > 0 && (
                    <div className="border border-main-600 rounded-16 p-16 mb-24 bg-main-50">
                        <div className="flex-between">
                            <span className="fw-bold">
                                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex-align gap-16">
                                <select
                                    className="form-select"
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    style={{ width: 'auto' }}
                                >
                                    <option value="">Bulk Actions</option>
                                    <option value="delete">Delete Selected</option>
                                    <option value="activate">Set Active</option>
                                    <option value="deactivate">Set Inactive</option>
                                </select>
                                <button
                                    className="btn btn-main btn-sm"
                                    onClick={handleBulkAction}
                                >
                                    Apply
                                </button>
                                <button
                                    className="btn btn-outline-main btn-sm"
                                    onClick={() => setSelectedProducts([])}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Table - FIXED VERSION */}
                <div className="border border-gray-100 rounded-16 overflow-hidden bg-white">
                    {loading ? (
                        <div className="text-center py-80">
                            <div className="spinner-border text-main-600"></div>
                            <p className="mt-16 text-gray-500">Loading products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-80">
                            <i className="ph ph-package text-gray-300" style={{ fontSize: '80px' }}></i>
                            <h5 className="mt-24 mb-16">No Products Yet</h5>
                            <p className="text-gray-500 mb-32">Start adding products to your store</p>
                            <Link
                                to={`/seller/stores/${storeId}/products/create`}
                                className="btn btn-main px-40"
                            >
                                <i className="ph ph-plus me-8"></i>
                                Add First Product
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th style={{ width: '100px' }} className="text-center">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={selectedProducts.length === products.length && products.length > 0}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th style={{ width: '130px' }} className="text-center">Image</th>
                                            <th className="text-center">Product Name</th>
                                            <th style={{ width: '120px' }} className="text-center">Price</th>
                                            <th style={{ width: '120px' }} className="text-center">Stock</th>
                                            <th style={{ width: '120px' }} className="text-center">Sold</th>
                                            <th style={{ width: '130px' }} className="text-center">Status</th>
                                            <th style={{ width: '160px' }} className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.product_id} className="border-bottom">
                                                {/* Checkbox */}
                                                <td className="text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={selectedProducts.includes(product.product_id)}
                                                        onChange={() => handleSelectProduct(product.product_id)}
                                                    />
                                                </td>

                                                {/* Image */}
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center">
                                                        <img
                                                            src={
                                                                product.images?.[0]?.image_url
                                                                    ? `${process.env.REACT_APP_IMAGE_URL}${product.images[0].image_url}`
                                                                    : '/images/placeholder-product.jpg'
                                                            }
                                                            alt={product.product_name}
                                                            className="rounded-8 border"
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                objectFit: 'cover',
                                                            }}
                                                            onError={(e) => {
                                                                e.target.src = '/images/placeholder-product.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                </td>

                                                {/* Product Name + Category */}
                                                <td>
                                                    <div className="fw-semibold text-dark mb-1">
                                                        {product.product_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.category?.category_name || 'No Category'}
                                                    </div>
                                                </td>

                                                {/* Price */}
                                                <td className="text-center fw-bold text-main-600">
                                                    {parseInt(product.price || 0).toLocaleString('vi-VN')}đ
                                                </td>

                                                {/* Stock */}
                                                <td className="text-center">
                                                    <span
                                                        className={`badge ${product.stock_quantity === 0
                                                                ? 'bg-danger'
                                                                : product.stock_quantity < 10
                                                                    ? 'bg-warning text-dark'
                                                                    : 'bg-success'
                                                            } px-3 py-2`}
                                                    >
                                                        {product.stock_quantity || 0}
                                                    </span>
                                                </td>

                                                {/* Sold */}
                                                <td className="text-center fw-semibold">
                                                    {product.sold_quantity || 0}
                                                </td>

                                                {/* Status */}
                                                <td className="text-center">
                                                    <span
                                                        className={`badge ${getStatusBadge(product.status)} px-3 py-2 text-white`}
                                                    >
                                                        {getStatusText(product.status)}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="text-center">
                                                    <div className="action-buttons">
                                                        <Link
                                                            to={`/products/${product.product_id}`}
                                                            className="action-btn btn-view"
                                                            title="View"
                                                            target="_blank"
                                                        >
                                                            <i className="ph ph-eye"></i>
                                                        </Link>
                                                        <Link
                                                            to={`/seller/products/${product.product_id}/edit`}
                                                            className="action-btn btn-edit"
                                                            title="Edit"
                                                        >
                                                            <i className="ph ph-pencil"></i>
                                                        </Link>
                                                        <button
                                                            className="action-btn btn-delete"
                                                            title="Delete"
                                                            onClick={() => handleDeleteProduct(product.product_id)}
                                                        >
                                                            <i className="ph ph-trash"></i>
                                                        </button>
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
                                    <div className="flex-between flex-wrap gap-16">
                                        <div className="text-sm text-gray-500">
                                            Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                                            {Math.min(pagination.currentPage * filters.limit, pagination.totalItems)} of{' '}
                                            {pagination.totalItems} products
                                        </div>
                                        <nav>
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                                                        disabled={pagination.currentPage === 1}
                                                    >
                                                        Previous
                                                    </button>
                                                </li>
                                                {[...Array(pagination.totalPages)].map((_, i) => (
                                                    <li
                                                        key={i + 1}
                                                        className={`page-item ${pagination.currentPage === i + 1 ? 'active' : ''}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handleFilterChange('page', i + 1)}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                                                        disabled={pagination.currentPage === pagination.totalPages}
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

export default ManageProducts;