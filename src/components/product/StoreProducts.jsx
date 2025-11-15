import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactSlider from 'react-slider';
import storeService from '../../services/storeService';
import categoryService from '../../services/categoryService';

const StoreProducts = () => {
    const { storeId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [grid, setGrid] = useState(true);
    const [active, setActive] = useState(false);
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);

    // Filters từ URL
    const [filters, setFilters] = useState({
        page: parseInt(searchParams.get('page')) || 1,
        limit: 20,
        category_id: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
        min_price: searchParams.get('min_price') || '',
        max_price: searchParams.get('max_price') || '',
        sort_by: searchParams.get('sort_by') || 'created_at',
        order: searchParams.get('order') || 'DESC'
    });

    const sidebarController = () => {
        setActive(!active);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchStoreProducts();
        updateURLParams();
    }, [filters, storeId]);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getCategories({
                status: 'active',
                hierarchy: 'true'
            });
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to load categories');
        }
    };

    const fetchStoreProducts = async () => {
        setLoading(true);
        try {
            const response = await storeService.getStoreProducts(storeId, filters);
            if (response.success) {
                setStore(response.data.store);
                setProducts(response.data.products);
                setPagination(response.pagination);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load store products');
        } finally {
            setLoading(false);
        }
    };

    const updateURLParams = () => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] && filters[key] !== '') {
                params.set(key === 'category_id' ? 'category' : key, filters[key]);
            }
        });
        setSearchParams(params);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: key !== 'page' ? 1 : value
        }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const searchValue = e.target.search.value;
        handleFilterChange('search', searchValue);
    };

    const resetFilters = () => {
        setFilters({
            page: 1,
            limit: 20,
            category_id: '',
            search: '',
            min_price: '',
            max_price: '',
            sort_by: 'created_at',
            order: 'DESC'
        });
    };

    const renderCategoryTree = (cats, level = 0) => {
        return cats.map(cat => (
            <div key={cat.category_id} style={{ paddingLeft: `${level * 16}px` }}>
                <Link
                    className="text-gray-900 hover-text-main-600 d-block mb-16"
                    onClick={() => handleFilterChange('category_id', cat.category_id)}
                >
                    {cat.category_name}
                    {cat.products_count && (
                        <span className="badge bg-gray-200 text-dark ms-2">{cat.products_count}</span>
                    )}
                </Link>
                {cat.subcategories?.length > 0 && renderCategoryTree(cat.subcategories, level + 1)}
            </div>
        ));
    };

    return (
        <section className="shop py-80">
            <div className={`side-overlay ${active && "show"}`}></div>
            <div className="container container-lg">
                {/* Store Header */}
                {store && (
                    <div className="store-header bg-white rounded-16 p-32 mb-32 shadow-sm">
                        <div className="row align-items-center">
                            <div className="col-auto">
                                {store.logo_url ? (
                                    <img
                                        src={`${process.env.REACT_APP_IMAGE_URL}${store.logo_url}`}
                                        alt={store.store_name}
                                        className="rounded-circle"
                                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="bg-main-50 rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '80px', height: '80px' }}>
                                        <i className="ph ph-storefront text-main-600" style={{ fontSize: '40px' }}></i>
                                    </div>
                                )}
                            </div>
                            <div className="col">
                                <h3 className="mb-8">{store.store_name}</h3>
                                {store.description && (
                                    <p className="text-gray-600 mb-0">{store.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="row">
                    {/* Sidebar Start */}
                    <div className="col-lg-3">
                        <div className={`shop-sidebar ${active && "active"}`}>
                            <button
                                onClick={sidebarController}
                                type="button"
                                className="shop-sidebar__close d-lg-none d-flex w-32 h-32 flex-center border border-gray-100 rounded-circle hover-bg-main-600 position-absolute inset-inline-end-0 me-10 mt-8 hover-text-white hover-border-main-600"
                            >
                                <i className="ph ph-x" />
                            </button>

                            {/* Category Filter */}
                            <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                                    Product Category
                                </h6>
                                <ul className="max-h-540 overflow-y-auto scroll-sm">
                                    <li className="mb-24">
                                        <Link
                                            onClick={() => handleFilterChange('category_id', '')}
                                            className="text-gray-900 hover-text-main-600"
                                        >
                                            All Categories
                                        </Link>
                                        {renderCategoryTree(categories)}
                                    </li>
                                </ul>
                            </div>

                            {/* Price Filter */}
                            <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                                    Filter by Price
                                </h6>
                                <div className="custom--range">
                                    <ReactSlider
                                        className="horizontal-slider"
                                        thumbClassName="example-thumb"
                                        trackClassName="example-track"
                                        defaultValue={[filters.min_price || 0, filters.max_price || 1000]}
                                        ariaLabel={['Lower thumb', 'Upper thumb']}
                                        ariaValuetext={state => `Thumb value ${state.valueNow}`}
                                        renderThumb={(props, state) => {
                                            const { key, ...restProps } = props;
                                            return <div {...restProps} key={state.index}>{state.valueNow}</div>;
                                        }}
                                        pearling
                                        minDistance={10}
                                        onChange={(values) => {
                                            setFilters(prev => ({
                                                ...prev,
                                                min_price: values[0],
                                                max_price: values[1]
                                            }));
                                        }}
                                    />
                                    <br />
                                    <br />
                                    <div className="flex-between flex-wrap-reverse gap-8 mt-24">
                                        <button
                                            type="button"
                                            className="btn btn-main h-40 flex-align"
                                            onClick={() => fetchStoreProducts()}
                                        >
                                            Filter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Sidebar End */}

                    {/* Content Start */}
                    <div className="col-lg-9">
                        {/* Top Start */}
                        <div className="flex-between gap-16 flex-wrap mb-40">
                            <span className="text-gray-900">
                                Showing {products.length} of {pagination?.totalItems[0].count || 0} products
                            </span>
                            <div className="position-relative flex-align gap-16 flex-wrap">
                                {/* Grid/List Toggle */}
                                <div className="list-grid-btns flex-align gap-16">
                                    <button
                                        onClick={() => setGrid(true)}
                                        type="button"
                                        className={`w-44 h-44 flex-center border rounded-6 text-2xl list-btn border-gray-100 ${grid === true && "border-main-600 text-white bg-main-600"}`}
                                    >
                                        <i className="ph-bold ph-list-dashes" />
                                    </button>
                                    <button
                                        onClick={() => setGrid(false)}
                                        type="button"
                                        className={`w-44 h-44 flex-center border rounded-6 text-2xl grid-btn border-gray-100 ${grid === false && "border-main-600 text-white bg-main-600"}`}
                                    >
                                        <i className="ph ph-squares-four" />
                                    </button>
                                </div>

                                {/* Sort Dropdown */}
                                <div className="position-relative text-gray-500 flex-align gap-4 text-14">
                                    <label htmlFor="sorting" className="text-inherit flex-shrink-0">
                                        Sort by:
                                    </label>
                                    <select
                                        className="form-control common-input px-14 py-14 text-inherit rounded-6 w-auto"
                                        id="sorting"
                                        value={`${filters.sort_by}_${filters.order}`}
                                        onChange={(e) => {
                                            const [sort_by, order] = e.target.value.split('_');
                                            setFilters(prev => ({ ...prev, sort_by, order }));
                                        }}
                                    >
                                        <option value="created_at_DESC">Newest First</option>
                                        <option value="created_at_ASC">Oldest First</option>
                                        <option value="price_ASC">Price: Low to High</option>
                                        <option value="price_DESC">Price: High to Low</option>
                                        <option value="sold_quantity_DESC">Best Selling</option>
                                        <option value="product_name_ASC">Name: A to Z</option>
                                        <option value="product_name_DESC">Name: Z to A</option>
                                    </select>
                                </div>

                                {/* Sidebar Toggle (Mobile) */}
                                <button
                                    onClick={sidebarController}
                                    type="button"
                                    className="w-44 h-44 d-lg-none d-flex flex-center border border-gray-100 rounded-6 text-2xl sidebar-btn"
                                >
                                    <i className="ph-bold ph-funnel" />
                                </button>
                            </div>
                        </div>
                        {/* Top End */}

                        {/* Loading State */}
                        {loading ? (
                            <div className="text-center py-80">
                                <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
                                <p className="mt-16 text-gray-500">Loading products...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-80">
                                <i className="ph ph-package text-gray-300" style={{ fontSize: '80px' }}></i>
                                <h5 className="mt-24 mb-16">No Products Found</h5>
                                <p className="text-gray-500 mb-32">
                                    This store doesn't have any products matching your filters
                                </p>
                                <button className="btn btn-main px-40" onClick={resetFilters}>
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Products Grid/List */}
                                <div className={`list-grid-wrapper ${grid && "list-view"}`}>
                                    {products.map(product => (
                                        grid ? (
                                            <div key={product.product_id} className="col-lg-4 col-md-6">
                                                <ProductCard product={product} />
                                            </div>
                                        ) : (
                                            <ProductListItem key={product.product_id} product={product} />
                                        )
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="flex-center mt-48">
                                        <ul className="pagination flex-center flex-wrap gap-16">
                                            <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                                <Link
                                                    onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                                                    className="page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                                >
                                                    <i className="ph-bold ph-arrow-left" />
                                                </Link>
                                            </li>
                                            {[...Array(pagination.totalPages)].map((_, i) => {
                                                const page = i + 1;
                                                if (
                                                    page === 1 ||
                                                    page === pagination.totalPages ||
                                                    (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                                                ) {
                                                    return (
                                                        <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                                                            <Link
                                                                onClick={() => handleFilterChange('page', page)}
                                                                className="page-link h-64 w-64 flex-center text-md rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                                            >
                                                                {page}
                                                            </Link>
                                                        </li>
                                                    );
                                                } else if (
                                                    page === pagination.currentPage - 2 ||
                                                    page === pagination.currentPage + 2
                                                ) {
                                                    return (
                                                        <li key={page} className="page-item disabled">
                                                            <span className="page-link">...</span>
                                                        </li>
                                                    );
                                                }
                                                return null;
                                            })}
                                            <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                                <Link
                                                    onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                                                    className="page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                                >
                                                    <i className="ph-bold ph-arrow-right" />
                                                </Link>
                                            </li>
                                        </ul>
                                        <div className="ms-32 text-sm text-gray-500">
                                            Page {pagination.currentPage} of {pagination.totalPages}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    {/* Content End */}
                </div>
            </div>
        </section>
    );
};

// Product Card Component (Grid View)
const ProductCard = ({ product }) => {
    return (
        <div className="product-card h-100 p-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
            <Link
                to={`/products/${product.product_id}`}
                className="product-card__thumb flex-center rounded-8 bg-gray-50 position-relative"
            >
                <img
                    src={product.images?.[0]?.image_url ? `${process.env.REACT_APP_IMAGE_URL}${product.images[0].image_url}` : '/placeholder.jpg'}
                    alt={product.product_name}
                    className="w-auto max-w-unset"
                    style={{ height: '150px', objectFit: 'cover' }}
                />
            </Link>
            <div className="product-card__content mt-16">
                <h6 className="title text-lg fw-semibold mt-12 mb-8">
                    <Link
                        to={`/products/${product.product_id}`}
                        className="link text-line-2"
                    >
                        {product.product_name}
                    </Link>
                </h6>
                <div className="flex-align mb-20 mt-16 gap-6">
                    <span className="text-xs fw-medium text-gray-500">{product.average_rating}</span>
                    <span className="text-15 fw-medium text-warning-600 d-flex">
                        <i className="ph-fill ph-star" />
                    </span>
                    <span className="text-xs fw-medium text-gray-500">({product.review_count})</span>
                </div>
                <div className="mt-8">
                    <div
                        className="progress w-100 bg-color-three rounded-pill h-4"
                        role="progressbar"
                        aria-valuenow={Math.round((product.sold_quantity / product.stock_quantity) * 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="progress-bar bg-main-two-600 rounded-pill"
                            style={{ width: `${Math.round((product.sold_quantity / product.stock_quantity) * 100)}%` }}
                        />
                    </div>
                    <span className="text-gray-900 text-xs fw-medium mt-8">
                        Sold: {product.sold_quantity}/{product.stock_quantity}
                    </span>
                </div>
                <div className="product-card__price my-20">
                    <span className="text-heading text-md fw-semibold">
                        ${product.price} <span className="text-gray-500 fw-normal">/Qty</span>
                    </span>
                </div>
                <Link
                    to="/cart"
                    className="product-card__cart btn bg-gray-50 text-heading hover-bg-main-600 hover-text-white py-11 px-24 rounded-8 flex-center gap-8 fw-medium"
                >
                    Add To Cart <i className="ph ph-shopping-cart" />
                </Link>
            </div>
        </div>
    );
};

// Product List Item Component (List View)
const ProductListItem = ({ product }) => {
    return (
        <div className="product-card h-100 p-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
            <Link
                to={`/products/${product.product_id}`}
                className="product-card__thumb flex-center rounded-8 bg-gray-50 position-relative"
            >
                <img
                    src={product.images?.[0]?.image_url ? `${process.env.REACT_APP_IMAGE_URL}${product.images[0].image_url}` : '/placeholder.jpg'}
                    alt={product.product_name}
                    className="w-auto max-w-unset"
                    style={{ height: '150px', objectFit: 'cover' }}
                />
            </Link>
            <div className="product-card__content mt-16">
                <h6 className="title text-lg fw-semibold mt-12 mb-8">
                    <Link
                        to={`/products/${product.product_id}`}
                        className="link text-line-2"
                    >
                        {product.product_name}
                    </Link>
                </h6>
                <div className="flex-align mb-20 mt-16 gap-6">
                    <span className="text-xs fw-medium text-gray-500">{product.average_rating}</span>
                    <span className="text-15 fw-medium text-warning-600 d-flex">
                        <i className="ph-fill ph-star" />
                    </span>
                    <span className="text-xs fw-medium text-gray-500">({product.review_count})</span>
                </div>
                <div className="mt-8">
                    <div
                        className="progress w-100 bg-color-three rounded-pill h-4"
                        role="progressbar"
                        aria-valuenow={Math.round((product.sold_quantity / product.stock_quantity) * 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="progress-bar bg-main-two-600 rounded-pill"
                            style={{ width: `${Math.round((product.sold_quantity / product.stock_quantity) * 100)}%` }}
                        />
                    </div>
                    <span className="text-gray-900 text-xs fw-medium mt-8">
                        Sold: {product.sold_quantity}/{product.stock_quantity}
                    </span>
                </div>
                <div className="product-card__price my-20">
                    <span className="text-heading text-md fw-semibold">
                        ${product.price} <span className="text-gray-500 fw-normal">/Qty</span>
                    </span>
                </div>
                <Link
                    to="/cart"
                    className="product-card__cart btn bg-gray-50 text-heading hover-bg-main-600 hover-text-white py-11 px-24 rounded-8 flex-center gap-8 fw-medium"
                >
                    Add To Cart <i className="ph ph-shopping-cart" />
                </Link>
            </div>
        </div>
    );
};

export default StoreProducts;