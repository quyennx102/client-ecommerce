import ReactSlider from 'react-slider';
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

const ProductList = () => {
    const [grid, setGrid] = useState(true);
    const [active, setActive] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stores, setStores] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [ratingDistribution, setRatingDistribution] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);

    // ✅ Khởi tạo filters từ URL params
    const getFiltersFromURL = () => ({
        page: parseInt(searchParams.get('page')) || 1,
        limit: 20,
        category_id: searchParams.get('category') || '',
        store_id: searchParams.get('store') || '',
        search: searchParams.get('search') || '',
        min_price: searchParams.get('min_price') || '',
        max_price: searchParams.get('max_price') || '',
        min_rating: searchParams.get('min_rating') || '',
        sort_by: searchParams.get('sort_by') || 'created_at',
        order: searchParams.get('order') || 'DESC'
    });

    const [filters, setFilters] = useState(getFiltersFromURL());

    // Slider values
    const [priceSliderValues, setPriceSliderValues] = useState([0, 1000]);

    const sidebarController = () => {
        setActive(!active);
    };

    // ✅ Lắng nghe thay đổi URL và update filters
    useEffect(() => {
        const newFilters = getFiltersFromURL();
        setFilters(newFilters);
    }, [searchParams]);

    useEffect(() => {
        fetchFilterOptions();
        fetchCategories();
    }, []);

    // ✅ Fetch products khi filters thay đổi
    useEffect(() => {
        fetchProducts();
        updateURLParams();
    }, [filters]);

    const fetchFilterOptions = async () => {
        try {
            const response = await productService.getFilterOptions();
            if (response.success) {
                setStores(response.data.stores);
                setPriceRange(response.data.priceRange);
                setRatingDistribution(response.data.ratingDistribution);

                // Initialize slider values
                setPriceSliderValues([
                    filters.min_price || response.data.priceRange.min,
                    filters.max_price || response.data.priceRange.max
                ]);
            }
        } catch (error) {
            console.error('Failed to load filter options');
        }
    };

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

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getProducts(filters);
            if (response.success) {
                setProducts(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const updateURLParams = () => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] && filters[key] !== '') {
                const paramKey = key === 'category_id' ? 'category' :
                    key === 'store_id' ? 'store' : key;
                params.set(paramKey, filters[key]);
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

    const handlePriceSliderChange = (values) => {
        setPriceSliderValues(values);
    };

    const applyPriceFilter = () => {
        setFilters(prev => ({
            ...prev,
            min_price: priceSliderValues[0],
            max_price: priceSliderValues[1],
            page: 1
        }));
    };

    const handleRatingFilter = (rating) => {
        // ✅ Toggle rating - nếu đang chọn rating đó thì bỏ chọn
        if (filters.min_rating == rating) {
            handleFilterChange('min_rating', '');
        } else {
            handleFilterChange('min_rating', rating);
        }
    };

    const resetFilters = () => {
        setFilters({
            page: 1,
            limit: 20,
            category_id: '',
            store_id: '',
            search: '',
            min_price: '',
            max_price: '',
            min_rating: '',
            sort_by: 'created_at',
            order: 'DESC'
        });
        setPriceSliderValues([priceRange.min, priceRange.max]);
        navigate('/products'); // Reset URL
    };

    // ✅ Helper để lấy tên category (bao gồm cả subcategories)
    const getCategoryName = (categoryId) => {
        if (!categoryId) return null;

        const findCategory = (cats) => {
            for (const cat of cats) {
                if (cat.category_id == categoryId) return cat.category_name;
                if (cat.subcategories) {
                    const found = findCategory(cat.subcategories);
                    if (found) return found;
                }
            }
            return null;
        };
        return findCategory(categories) || `Category #${categoryId}`;
    };

    const getStoreName = (storeId) => {
        const store = stores.find(s => s.store_id == storeId);
        return store ? store.store_name : `Store #${storeId}`;
    };

    // ✅ Render category tree với highlight
    const renderCategoryTree = (cats, level = 0) => {
        return cats.map(cat => (
            <div key={cat.category_id} style={{ paddingLeft: `${level * 15}px` }}>
                <Link
                    onClick={(e) => {
                        e.preventDefault();
                        // Toggle category - nếu đang chọn thì bỏ chọn (chọn All)
                        if (filters.category_id == cat.category_id) {
                            handleFilterChange('category_id', '');
                        } else {
                            handleFilterChange('category_id', cat.category_id);
                        }
                    }}
                    className={`text-gray-900 hover-text-main-600 d-block mb-2 ${filters.category_id == cat.category_id ? 'text-main-600 fw-semibold' : ''
                        }`}
                    style={{ cursor: 'pointer' }}
                >
                    {cat.category_name}
                    {cat.products_count && (
                        <span className="badge bg-gray-200 text-dark ms-2">
                            {cat.products_count}
                        </span>
                    )}
                </Link>
                {cat.subcategories?.length > 0 && renderCategoryTree(cat.subcategories, level + 1)}
            </div>
        ));
    };

    // ✅ Check xem có filter nào active không
    const hasActiveFilters = () => {
        return !!(
            filters.category_id ||
            filters.store_id ||
            filters.min_price ||
            filters.max_price ||
            filters.min_rating ||
            filters.search
        );
    };

    return (
        <section className="shop py-80">
            <div className={`side-overlay ${active && "show"}`} onClick={sidebarController}></div>
            <div className="container container-lg">
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
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleFilterChange('category_id', '');
                                            }}
                                            className={`text-gray-900 hover-text-main-600 d-block ${!filters.category_id ? 'text-main-600 fw-semibold' : ''
                                                }`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            All Categories
                                        </Link>
                                        <div className="mt-16">
                                            {renderCategoryTree(categories)}
                                        </div>
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
                                        value={priceSliderValues}
                                        min={priceRange.min}
                                        max={priceRange.max}
                                        onChange={handlePriceSliderChange}
                                        ariaLabel={['Lower thumb', 'Upper thumb']}
                                        ariaValuetext={state => `Thumb value ${state.valueNow}`}
                                        renderThumb={(props, state) => {
                                            const { key, ...restProps } = props;
                                            return (
                                                <div {...restProps} key={state.index}>
                                                    ${state.valueNow}
                                                </div>
                                            );
                                        }}
                                        pearling
                                        minDistance={1}
                                    />

                                    <br />
                                    <br />
                                    <div className="flex-between flex-wrap-reverse gap-8 mt-24">
                                        <button
                                            type="button"
                                            className="btn btn-main h-40 flex-align"
                                            onClick={applyPriceFilter}
                                        >
                                            Filter
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                                    Filter by Rating
                                </h6>
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const ratingData = ratingDistribution.find(r => r.rating === rating);
                                    const percentage = ratingData
                                        ? (ratingData.count / ratingDistribution.reduce((sum, r) => sum + parseInt(r.count), 0)) * 100
                                        : 0;

                                    return (
                                        <div key={rating} className="flex-align gap-8 position-relative mb-20">
                                            <label
                                                className="position-absolute w-100 h-100 cursor-pointer"
                                                htmlFor={`rating${rating}`}
                                            />
                                            <div className="common-check common-radio mb-0">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="rating"
                                                    id={`rating${rating}`}
                                                    checked={filters.min_rating == rating}
                                                    onChange={() => handleRatingFilter(rating)}
                                                />
                                            </div>
                                            <div
                                                className="progress w-100 bg-gray-100 rounded-pill h-8"
                                                role="progressbar"
                                            >
                                                <div
                                                    className="progress-bar bg-main-600 rounded-pill"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <div className="flex-align gap-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`text-xs fw-medium d-flex ${i < rating ? 'text-warning-600' : 'text-gray-400'
                                                            }`}
                                                    >
                                                        <i className="ph-fill ph-star" />
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="text-gray-900 flex-shrink-0">
                                                {ratingData?.count || 0}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Brand/Store Filter */}
                            <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                                    Filter by Brand
                                </h6>
                                <ul className="max-h-540 overflow-y-auto scroll-sm">
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="store"
                                                id="store-all"
                                                checked={!filters.store_id}
                                                onChange={() => handleFilterChange('store_id', '')}
                                            />
                                            <label className="form-check-label" htmlFor="store-all">
                                                All Brands
                                            </label>
                                        </div>
                                    </li>
                                    {stores.map((store) => (
                                        <li key={store.store_id} className="mb-24">
                                            <div className="form-check common-check common-radio">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="store"
                                                    id={`store${store.store_id}`}
                                                    checked={filters.store_id == store.store_id}
                                                    onChange={() => handleFilterChange('store_id', store.store_id)}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor={`store${store.store_id}`}
                                                >
                                                    {store.store_name}
                                                    <span className="badge bg-gray-200 text-dark ms-2">
                                                        {store.product_count}
                                                    </span>
                                                </label>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="shop-sidebar__box rounded-8">
                                <img src="assets/images/thumbs/newsletter-img.png" alt="" />
                            </div>
                        </div>
                    </div>
                    {/* Sidebar End */}

                    {/* Content Start */}
                    <div className="col-lg-9">
                        {/* Top Controls */}
                        <div className="flex-between gap-16 flex-wrap mb-40">
                            <span className="text-gray-900">
                                Showing {products.length > 0 ? ((pagination?.currentPage - 1) * pagination?.itemsPerPage + 1) : 0}-
                                {Math.min(pagination?.currentPage * pagination?.itemsPerPage, pagination?.totalItems)} of {pagination?.totalItems} results
                            </span>
                            <div className="position-relative flex-align gap-16 flex-wrap">
                                <div className="list-grid-btns flex-align gap-16">
                                    <button
                                        onClick={() => setGrid(true)}
                                        type="button"
                                        className={`w-44 h-44 flex-center border rounded-6 text-2xl border-gray-100 ${grid === true && "border-main-600 text-white bg-main-600"
                                            }`}
                                    >
                                        <i className="ph-bold ph-list-dashes" />
                                    </button>
                                    <button
                                        onClick={() => setGrid(false)}
                                        type="button"
                                        className={`w-44 h-44 flex-center border rounded-6 text-2xl border-gray-100 ${grid === false && "border-main-600 text-white bg-main-600"
                                            }`}
                                    >
                                        <i className="ph ph-squares-four" />
                                    </button>
                                </div>
                                <div className="position-relative text-gray-500 flex-align gap-4 text-14">
                                    <label htmlFor="sorting" className="text-inherit flex-shrink-0">
                                        Sort by:
                                    </label>
                                    <select
                                        className="form-control common-input px-14 py-14 text-inherit rounded-6"
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
                                <button
                                    onClick={sidebarController}
                                    type="button"
                                    className="w-44 h-44 d-lg-none d-flex flex-center border border-gray-100 rounded-6 text-2xl"
                                >
                                    <i className="ph-bold ph-funnel" />
                                </button>
                            </div>
                        </div>

                        {/* ✅ Active Filters Display */}
                        {hasActiveFilters() && (
                            <div className="flex-align gap-8 flex-wrap mb-24 p-16 bg-gray-50 rounded-8">
                                {(filters.search || filters.category_id || filters.store_id || filters.min_price || filters.max_price || filters.min_rating) && (
                                    <div className="flex-align gap-8 flex-wrap mb-24 p-16 bg-gray-50 rounded-8">
                                        <span className="text-sm text-gray-600 fw-medium">
                                            <i className="ph ph-funnel me-2"></i>
                                            Active Filters:
                                        </span>

                                        {filters.search && (
                                            <span className="badge bg-primary text-white px-16 py-8 d-flex align-items-center gap-8">
                                                <i className="ph ph-magnifying-glass"></i>
                                                Search: "{filters.search}"
                                                <button
                                                    className="ms-4 bg-transparent border-0 text-white"
                                                    onClick={() => handleFilterChange('search', '')}
                                                    style={{ fontSize: '18px', lineHeight: 1, cursor: 'pointer' }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}

                                        {filters.category_id && (
                                            <span className="badge bg-main-600 text-white px-16 py-8 d-flex align-items-center gap-8">
                                                <i className="ph ph-tag"></i>
                                                {getCategoryName(filters.category_id)}
                                                <button
                                                    className="ms-4 bg-transparent border-0 text-white"
                                                    onClick={() => handleFilterChange('category_id', '')}
                                                    style={{ fontSize: '18px', lineHeight: 1, cursor: 'pointer' }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}

                                        {filters.store_id && (
                                            <span className="badge bg-info text-white px-16 py-8 d-flex align-items-center gap-8">
                                                <i className="ph ph-storefront"></i>
                                                {getStoreName(filters.store_id)}
                                                <button
                                                    className="ms-4 bg-transparent border-0 text-white"
                                                    onClick={() => handleFilterChange('store_id', '')}
                                                    style={{ fontSize: '18px', lineHeight: 1, cursor: 'pointer' }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}

                                        {(filters.min_price || filters.max_price) && (
                                            <span className="badge bg-success text-white px-16 py-8 d-flex align-items-center gap-8">
                                                <i className="ph ph-currency-dollar"></i>
                                                ${filters.min_price || priceRange.min} - ${filters.max_price || priceRange.max}
                                                <button
                                                    className="ms-4 bg-transparent border-0 text-white"
                                                    onClick={() => {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            min_price: '',
                                                            max_price: '',
                                                            page: 1
                                                        }));
                                                        setPriceSliderValues([priceRange.min, priceRange.max]);
                                                    }}
                                                    style={{ fontSize: '18px', lineHeight: 1, cursor: 'pointer' }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}

                                        {filters.min_rating && (
                                            <span className="badge bg-warning text-dark px-16 py-8 d-flex align-items-center gap-8">
                                                <i className="ph-fill ph-star"></i>
                                                {filters.min_rating}+ Stars
                                                <button
                                                    className="ms-4 bg-transparent border-0 text-dark"
                                                    onClick={() => handleFilterChange('min_rating', '')}
                                                    style={{ fontSize: '18px', lineHeight: 1, cursor: 'pointer' }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                        <button
                                            className="btn btn-outline-main px-16 py-8 text-sm"
                                            onClick={resetFilters}
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Products Display */}
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
                                    Try adjusting your filters or search terms
                                </p>
                                <button className="btn btn-main px-40" onClick={resetFilters}>
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <>
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
                                    <div className="flex-between flex-wrap gap-16 mt-48">
                                        <ul className="pagination flex-center flex-wrap gap-16">
                                            <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                                <Link
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (pagination.currentPage > 1) {
                                                            handleFilterChange('page', pagination.currentPage - 1);
                                                        }
                                                    }}
                                                    className="page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                                    style={{ cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer' }}
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
                                                        <li
                                                            key={page}
                                                            className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}
                                                        >
                                                            <Link
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleFilterChange('page', page);
                                                                }}
                                                                className={`page-link h-64 w-64 flex-center text-md rounded-8 fw-medium border border-gray-100 ${pagination.currentPage === page
                                                                    ? 'bg-main-600 text-white border-main-600'
                                                                    : 'text-neutral-600'
                                                                    }`}
                                                                style={{ cursor: 'pointer' }}
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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (pagination.currentPage < pagination.totalPages) {
                                                            handleFilterChange('page', pagination.currentPage + 1);
                                                        }
                                                    }}
                                                    className="page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                                    style={{ cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <i className="ph-bold ph-arrow-right" />
                                                </Link>
                                            </li>
                                        </ul>
                                        <div className="text-sm text-gray-500">
                                            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} items)
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

// Product Card Component
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
                    >
                        <div
                            className="progress-bar bg-main-two-600 rounded-pill"
                            style={{ width: `${(product.sold_quantity / product.stock_quantity) * 100}%` }}
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

// Product List Item Component
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
                    >
                        <div
                            className="progress-bar bg-main-two-600 rounded-pill"
                            style={{ width: `${(product.sold_quantity / product.stock_quantity) * 100}%` }}
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

export default ProductList;