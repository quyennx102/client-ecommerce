import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import storeService from '../../services/storeService';
import sweetAlert from '../../utils/sweetAlert';

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
            'active': 'bg-success-600',
            'inactive': 'bg-gray-400',
            'out_of_stock': 'bg-danger-600'
        };
        return badges[status] || 'bg-gray-400';
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

    if (loading && products.length === 0) {
        return (
            <section className="cart py-80">
                <div className="container container-lg">
                    <div className="text-center">
                        <div className="spinner-border text-main-600" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-gray-600 mt-16">Loading products...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="cart py-80">
            <div className="container container-lg">
                {/* Header */}
                <div className="flex-between flex-wrap gap-16 mb-40">
                    <div>
                        <h4 className="mb-8">Manage Products</h4>
                        {store && (
                            <p className="text-gray-500 mb-0">
                                <i className="ph ph-storefront me-8"></i>
                                {store.store_name}
                            </p>
                        )}
                    </div>
                    <div className="flex-align gap-8">
                        <button
                            className="btn btn-outline-main py-12 px-24 rounded-8"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <i className={`ph ph-${showFilters ? 'funnel-simple-x' : 'funnel-simple'} me-8`}></i>
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </button>
                        <Link
                            to={`/seller/stores/${storeId}/products/create`}
                            className="btn btn-main py-12 px-32 rounded-8"
                        >
                            <i className="ph ph-plus me-8"></i>
                            Add New Product
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                {pagination && (
                    <div className="row g-12 mb-24">
                        <div className="col-xxl-3 col-sm-6">
                            <div className="border border-gray-100 rounded-16 p-24 bg-white hover-shadow-sm transition-2">
                                <div className="flex-between mb-16">
                                    <span className="text-gray-600 text-sm">Total Products</span>
                                    <i className="ph ph-package text-main-600" style={{fontSize: '24px'}}></i>
                                </div>
                                <h3 className="mb-0 text-main-600">{pagination?.totalItems?.[0]?.count || 0}</h3>
                            </div>
                        </div>
                        <div className="col-xxl-3 col-sm-6">
                            <div className="border border-gray-100 rounded-16 p-24 bg-white hover-shadow-sm transition-2">
                                <div className="flex-between mb-16">
                                    <span className="text-gray-600 text-sm">Active Products</span>
                                    <i className="ph ph-check-circle text-success-600" style={{fontSize: '24px'}}></i>
                                </div>
                                <h3 className="mb-0 text-success-600">
                                    {products.filter(p => p.status === 'active').length}
                                </h3>
                            </div>
                        </div>
                        <div className="col-xxl-3 col-sm-6">
                            <div className="border border-gray-100 rounded-16 p-24 bg-white hover-shadow-sm transition-2">
                                <div className="flex-between mb-16">
                                    <span className="text-gray-600 text-sm">Out of Stock</span>
                                    <i className="ph ph-warning text-danger-600" style={{fontSize: '24px'}}></i>
                                </div>
                                <h3 className="mb-0 text-danger-600">
                                    {products.filter(p => p.stock_quantity === 0).length}
                                </h3>
                            </div>
                        </div>
                        <div className="col-xxl-3 col-sm-6">
                            <div className="border border-gray-100 rounded-16 p-24 bg-white hover-shadow-sm transition-2">
                                <div className="flex-between mb-16">
                                    <span className="text-gray-600 text-sm">Total Sold</span>
                                    <i className="ph ph-trend-up text-warning-600" style={{fontSize: '24px'}}></i>
                                </div>
                                <h3 className="mb-0 text-warning-600">
                                    {products.reduce((sum, p) => sum + (p.sold_quantity || 0), 0)}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Bar */}
                {showFilters && (
                    <div className="border border-gray-100 rounded-16 p-24 mb-24 bg-white">
                        <div className="row g-16">
                            <div className="col-lg-4">
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="common-input common-input--lg"
                                        placeholder="Search products..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                    <i className="ph ph-magnifying-glass position-absolute top-50 translate-middle-y end-0 me-16 text-gray-500"></i>
                                </div>
                            </div>
                            <div className="col-lg-3">
                                <select
                                    className="common-input common-input--lg"
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
                                    className="common-input common-input--lg"
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
                                    className="btn btn-outline-main w-100 py-12 rounded-8"
                                    onClick={resetFilters}
                                >
                                    <i className="ph ph-x me-8"></i>
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Actions */}
                {selectedProducts.length > 0 && (
                    <div className="border border-main-600 rounded-16 p-16 mb-24 bg-main-50">
                        <div className="flex-between flex-wrap gap-16">
                            <span className="fw-semibold text-main-600">
                                <i className="ph ph-check-circle me-8"></i>
                                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex-align gap-8">
                                <select
                                    className="common-input"
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    style={{ width: '180px' }}
                                >
                                    <option value="">Bulk Actions</option>
                                    <option value="delete">Delete Selected</option>
                                    <option value="activate">Set Active</option>
                                    <option value="deactivate">Set Inactive</option>
                                </select>
                                <button
                                    className="btn btn-main py-9 px-24 rounded-8"
                                    onClick={handleBulkAction}
                                >
                                    Apply
                                </button>
                                <button
                                    className="btn btn-outline-main py-9 px-24 rounded-8"
                                    onClick={() => setSelectedProducts([])}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Table */}
                <div className="cart-table border border-gray-100 rounded-16 bg-white">
                    {products.length === 0 ? (
                        <div className="text-center py-80">
                            <i className="ph ph-package text-gray-300" style={{ fontSize: '80px' }}></i>
                            <h5 className="mt-24 mb-16 text-gray-900">No Products Yet</h5>
                            <p className="text-gray-500 mb-32">Start adding products to your store</p>
                            <Link
                                to={`/seller/stores/${storeId}/products/create`}
                                className="btn btn-main py-18 px-40 rounded-8"
                            >
                                <i className="ph ph-plus me-8"></i>
                                Add First Product
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto scroll-sm scroll-sm-horizontal">
                                <table className="table style-three">
                                    <thead>
                                        <tr>
                                            <th className="h6 mb-0 text-lg fw-bold" style={{width: '60px'}}>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={selectedProducts.length === products.length && products.length > 0}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="h6 mb-0 text-lg fw-bold" style={{width: '100px'}}>Image</th>
                                            <th className="h6 mb-0 text-lg fw-bold">Product</th>
                                            <th className="h6 mb-0 text-lg fw-bold text-center" style={{width: '120px'}}>Price</th>
                                            <th className="h6 mb-0 text-lg fw-bold text-center" style={{width: '120px'}}>Stock</th>
                                            <th className="h6 mb-0 text-lg fw-bold text-center" style={{width: '120px'}}>Sold</th>
                                            <th className="h6 mb-0 text-lg fw-bold text-center" style={{width: '120px'}}>Status</th>
                                            <th className="h6 mb-0 text-lg fw-bold text-center" style={{width: '150px'}}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.product_id}>
                                                {/* Checkbox */}
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={selectedProducts.includes(product.product_id)}
                                                        onChange={() => handleSelectProduct(product.product_id)}
                                                    />
                                                </td>

                                                {/* Image */}
                                                <td>
                                                    <div className="table-product__thumb border border-gray-100 rounded-8 flex-center" style={{width: '80px', height: '80px'}}>
                                                        <img
                                                            src={
                                                                product.images?.[0]?.image_url
                                                                    ? `${process.env.REACT_APP_IMAGE_URL}${product.images[0].image_url}`
                                                                    : '/images/placeholder-product.jpg'
                                                            }
                                                            alt={product.product_name}
                                                            className="w-100 h-100 object-fit-cover rounded-8"
                                                            onError={(e) => {
                                                                e.target.src = '/images/placeholder-product.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                </td>

                                                {/* Product Info */}
                                                <td>
                                                    <div className="table-product__content">
                                                        <h6 className="title text-lg fw-semibold mb-8">
                                                            <Link to={`/products/${product.product_id}`} className="link text-line-2">
                                                                {product.product_name}
                                                            </Link>
                                                        </h6>
                                                        <span className="text-sm text-gray-500">
                                                            <i className="ph ph-tag me-4"></i>
                                                            {product.category?.category_name || 'No Category'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Price */}
                                                <td className="text-center">
                                                    <span className="text-lg fw-bold text-main-600">
                                                        $ {product.price || 0}
                                                    </span>
                                                </td>

                                                {/* Stock */}
                                                <td className="text-center">
                                                    <span className={`px-16 py-6 text-sm fw-medium rounded-pill ${
                                                        product.stock_quantity === 0
                                                            ? 'bg-danger-50 text-danger-600'
                                                            : product.stock_quantity < 10
                                                            ? 'bg-warning-50 text-warning-600'
                                                            : 'bg-success-50 text-success-600'
                                                    }`}>
                                                        {product.stock_quantity || 0}
                                                    </span>
                                                </td>

                                                {/* Sold */}
                                                <td className="text-center">
                                                    <span className="fw-semibold text-gray-900">
                                                        {product.sold_quantity || 0}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="text-center">
                                                    <span style={{width: '100px'}} className={`px-16 py-6 text-sm fw-medium rounded-pill text-white ${getStatusBadge(product.status)}`}>
                                                        {getStatusText(product.status)}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="text-center">
                                                    <div className="flex-center gap-8">
                                                        <Link
                                                            to={`/products/${product.product_id}`}
                                                            className="w-40 h-40 bg-main-50 text-main-600 hover-bg-main-600 hover-text-white rounded-circle flex-center"
                                                            title="View"
                                                            target="_blank"
                                                        >
                                                            <i className="ph ph-eye text-xl"></i>
                                                        </Link>
                                                        <Link
                                                            to={`/seller/products/${product.product_id}/edit`}
                                                            className="w-40 h-40 bg-success-50 text-success-600 hover-bg-success-600 hover-text-white rounded-circle flex-center"
                                                            title="Edit"
                                                        >
                                                            <i className="ph ph-pencil-simple text-xl"></i>
                                                        </Link>
                                                        <button
                                                            className="w-40 h-40 bg-danger-50 text-danger-600 hover-bg-danger-600 hover-text-white rounded-circle flex-center"
                                                            title="Delete"
                                                            onClick={() => handleDeleteProduct(product.product_id)}
                                                        >
                                                            <i className="ph ph-trash text-xl"></i>
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
                                <div className="flex-between flex-wrap gap-16 mt-24 px-40 pb-40">
                                    <span className="text-gray-500 text-sm">
                                        Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                                        {Math.min(pagination.currentPage * filters.limit, pagination?.totalItems?.[0]?.count)} of{' '}
                                        {pagination?.totalItems?.[0]?.count} products
                                    </span>
                                    <ul className="pagination flex-align flex-wrap gap-8">
                                        <li className="page-item">
                                            <button
                                                className={`page-link h-48 w-48 flex-center text-xxl rounded-8 fw-medium ${
                                                    pagination.currentPage === 1 ? 'text-gray-300 pointer-events-none' : 'text-gray-900 hover-bg-main-600 hover-text-white'
                                                }`}
                                                onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1}
                                            >
                                                <i className="ph ph-caret-left"></i>
                                            </button>
                                        </li>
                                        {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                                            let pageNum;
                                            if (pagination.totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                                pageNum = pagination.totalPages - 4 + i;
                                            } else {
                                                pageNum = pagination.currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <li key={pageNum} className="page-item">
                                                    <button
                                                        className={`page-link h-48 w-48 flex-center text-md rounded-8 fw-medium ${
                                                            pagination.currentPage === pageNum 
                                                                ? 'bg-main-600 text-white' 
                                                                : 'text-gray-900 hover-bg-main-600 hover-text-white'
                                                        }`}
                                                        onClick={() => handleFilterChange('page', pageNum)}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                        <li className="page-item">
                                            <button
                                                className={`page-link h-48 w-48 flex-center text-xxl rounded-8 fw-medium ${
                                                    pagination.currentPage === pagination.totalPages ? 'text-gray-300 pointer-events-none' : 'text-gray-900 hover-bg-main-600 hover-text-white'
                                                }`}
                                                onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                            >
                                                <i className="ph ph-caret-right"></i>
                                            </button>
                                        </li>
                                    </ul>
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