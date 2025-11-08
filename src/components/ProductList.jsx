import ReactSlider from 'react-slider'
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

const ProductList = () => {

    let [grid, setGrid] = useState(true)

    let [active, setActive] = useState(false)
    let sidebarController = () => {
        setActive(!active)
    }

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

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

    // View mode
    const [viewMode, setViewMode] = useState('grid'); // grid or list

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
        updateURLParams();
    }, [filters]);

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
            <div key={cat.category_id}>
                <Link
                    className="text-gray-900 hover-text-main-600"
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
                <div className="row">
                    {/* Sidebar Start */}
                    <div className="col-lg-3">
                        <div className={`shop-sidebar ${active && "active"}`}>
                            <button onClick={sidebarController}
                                type="button"
                                className="shop-sidebar__close d-lg-none d-flex w-32 h-32 flex-center border border-gray-100 rounded-circle hover-bg-main-600 position-absolute inset-inline-end-0 me-10 mt-8 hover-text-white hover-border-main-600"
                            >
                                <i className="ph ph-x" />
                            </button>
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
                                        {/* <button
                                            className={`list-group-item list-group-item-action ${!filters.category_id ? 'active' : ''}`}
                                            onClick={() => handleFilterChange('category_id', '')}
                                        >
                                            All Categories
                                        </button> */}
                                        {renderCategoryTree(categories)}
                                    </li>
                                </ul>
                            </div>
                            <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                                    Filter by Price
                                </h6>
                                <div className="custom--range">
                                    <ReactSlider
                                        className="horizontal-slider"
                                        thumbClassName="example-thumb"
                                        trackClassName="example-track"
                                        defaultValue={[filters.min_price, filters.max_price]}
                                        ariaLabel={['Lower thumb', 'Upper thumb']}
                                        ariaValuetext={state => `Thumb value ${state.valueNow}`}
                                        renderThumb={(props, state) => {
                                            const { key, ...restProps } = props;
                                            return <div {...restProps} key={state.index}>{state.valueNow}</div>;
                                        }}
                                        pearling
                                        minDistance={filters.min_price}
                                    />

                                    <br />
                                    <br />
                                    <div className="flex-between flex-wrap-reverse gap-8 mt-24 ">
                                        <button type="button" className="btn btn-main h-40 flex-align">
                                            Filter{" "}
                                        </button>

                                    </div>
                                </div>
                            </div>

                            <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                                    Filter by Rating
                                </h6>
                                <div className="flex-align gap-8 position-relative mb-20">
                                    <label
                                        className="position-absolute w-100 h-100 cursor-pointer"
                                        htmlFor="rating5"
                                    >
                                        {" "}
                                    </label>
                                    <div className="common-check common-radio mb-0">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="rating5"
                                        />
                                    </div>
                                    <div
                                        className="progress w-100 bg-gray-100 rounded-pill h-8"
                                        role="progressbar"
                                        aria-label="Basic example"
                                        aria-valuenow={70}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >
                                        <div
                                            className="progress-bar bg-main-600 rounded-pill"
                                            style={{ width: "70%" }}
                                        />
                                    </div>
                                    <div className="flex-align gap-4">
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                    </div>
                                    <span className="text-gray-900 flex-shrink-0">124</span>
                                </div>
                                <div className="flex-align gap-8 position-relative mb-20">
                                    <label
                                        className="position-absolute w-100 h-100 cursor-pointer"
                                        htmlFor="rating4"
                                    >
                                        {" "}
                                    </label>
                                    <div className="common-check common-radio mb-0">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="rating4"
                                        />
                                    </div>
                                    <div
                                        className="progress w-100 bg-gray-100 rounded-pill h-8"
                                        role="progressbar"
                                        aria-label="Basic example"
                                        aria-valuenow={50}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >
                                        <div
                                            className="progress-bar bg-main-600 rounded-pill"
                                            style={{ width: "50%" }}
                                        />
                                    </div>
                                    <div className="flex-align gap-4">
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-gray-400 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                    </div>
                                    <span className="text-gray-900 flex-shrink-0">52</span>
                                </div>
                                <div className="flex-align gap-8 position-relative mb-20">
                                    <label
                                        className="position-absolute w-100 h-100 cursor-pointer"
                                        htmlFor="rating3"
                                    >
                                        {" "}
                                    </label>
                                    <div className="common-check common-radio mb-0">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="rating3"
                                        />
                                    </div>
                                    <div
                                        className="progress w-100 bg-gray-100 rounded-pill h-8"
                                        role="progressbar"
                                        aria-label="Basic example"
                                        aria-valuenow={35}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >
                                        <div
                                            className="progress-bar bg-main-600 rounded-pill"
                                            style={{ width: "35%" }}
                                        />
                                    </div>
                                    <div className="flex-align gap-4">
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-gray-400 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-gray-400 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                    </div>
                                    <span className="text-gray-900 flex-shrink-0">12</span>
                                </div>
                                <div className="flex-align gap-8 position-relative mb-20">
                                    <label
                                        className="position-absolute w-100 h-100 cursor-pointer"
                                        htmlFor="rating2"
                                    >
                                        {" "}
                                    </label>
                                    <div className="common-check common-radio mb-0">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="rating2"
                                        />
                                    </div>
                                    <div
                                        className="progress w-100 bg-gray-100 rounded-pill h-8"
                                        role="progressbar"
                                        aria-label="Basic example"
                                        aria-valuenow={20}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >
                                        <div
                                            className="progress-bar bg-main-600 rounded-pill"
                                            style={{ width: "20%" }}
                                        />
                                    </div>
                                    <div className="flex-align gap-4">
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-gray-400 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-gray-400 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-gray-400 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                    </div>
                                    <span className="text-gray-900 flex-shrink-0">5</span>
                                </div>
                                <div className="flex-align gap-8 position-relative mb-0">
                                    <label
                                        className="position-absolute w-100 h-100 cursor-pointer"
                                        htmlFor="rating1"
                                    >
                                        {" "}
                                    </label>
                                    <div className="common-check common-radio mb-0">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="rating1"
                                        />
                                    </div>
                                    <div
                                        className="progress w-100 bg-gray-100 rounded-pill h-8"
                                        role="progressbar"
                                        aria-label="Basic example"
                                        aria-valuenow={5}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >
                                        <div
                                            className="progress-bar bg-main-600 rounded-pill"
                                            style={{ width: "5%" }}
                                        />
                                    </div>
                                    <div className="flex-align gap-4">
                                        <span className="text-xs fw-medium text-warning-600 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-gray-400 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-gray-400 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-gray-400 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                        <span className="text-xs fw-medium text-gray-400 d-flex">
                                            <i className="ph-fill ph-star" />
                                        </span>
                                    </div>
                                    <span className="text-gray-900 flex-shrink-0">2</span>
                                </div>
                            </div>
                            <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                                    Filter by Color
                                </h6>
                                <ul className="max-h-540 overflow-y-auto scroll-sm">
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio checked-black">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="color1"
                                            />
                                            <label className="form-check-label" htmlFor="color1">
                                                Black(12)
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio checked-primary">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="color2"
                                            />
                                            <label className="form-check-label" htmlFor="color2">
                                                Blue (12)
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-0">
                                        <div className="form-check common-check common-radio checked-purple">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="color7"
                                            />
                                            <label className="form-check-label" htmlFor="color7">
                                                Purple (12)
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
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
                                                name="color"
                                                id="brand1"
                                            />
                                            <label className="form-check-label" htmlFor="brand1">
                                                Apple
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-24">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="brand2"
                                            />
                                            <label className="form-check-label" htmlFor="brand2">
                                                Samsung
                                            </label>
                                        </div>
                                    </li>
                                    <li className="mb-0">
                                        <div className="form-check common-check common-radio">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="color"
                                                id="Redmi"
                                            />
                                            <label className="form-check-label" htmlFor="Redmi">
                                                Redmi
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="shop-sidebar__box rounded-8">
                                <img src="assets/images/thumbs/advertise-img1.png" alt="" />
                            </div>
                        </div>
                    </div>
                    {/* Sidebar End */}
                    {/* Content Start */}
                    <div className="col-lg-9">
                        {/* Top Start */}
                        <div className="flex-between gap-16 flex-wrap mb-40 ">
                            <span className="text-gray-900">Showing 1-20 of result</span>
                            <div className="position-relative flex-align gap-16 flex-wrap">
                                <div className="list-grid-btns flex-align gap-16">
                                    <button onClick={() => setGrid(true)}
                                        type="button"
                                        className={`w-44 h-44 flex-center border rounded-6 text-2xl list-btn border-gray-100 ${grid === true && "border-main-600 text-white bg-main-600"}`}
                                    >
                                        <i className="ph-bold ph-list-dashes" />
                                    </button>
                                    <button onClick={() => setGrid(false)}
                                        type="button"
                                        className={`w-44 h-44 flex-center border rounded-6 text-2xl grid-btn border-gray-100 ${grid === false && "border-main-600 text-white bg-main-600"}`}
                                    >
                                        <i className="ph ph-squares-four" />
                                    </button>
                                </div>
                                <div className="position-relative text-gray-500 flex-align gap-4 text-14">
                                    <label htmlFor="sorting" className="text-inherit flex-shrink-0">
                                        Sort by:{" "}
                                    </label>
                                    <select
                                        className="form-control common-input px-14 py-14 text-inherit rounded-6 w-auto"
                                        id="sorting"
                                        style={{ width: 'auto' }}
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
                                <button onClick={sidebarController}
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
                                    Try adjusting your filters or search terms
                                </p>
                                <button className="btn btn-main px-40" onClick={resetFilters}>
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Products Grid View */}
                                {grid && (
                                    <div className={`list-grid-wrapper ${grid && "list-view"}`}>
                                        {products.map(product => (
                                            <div key={product.product_id} className="col-lg-4 col-md-6">
                                                <ProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Products List View */}
                                {!grid && (
                                    <div className={`list-grid-wrapper ${grid && "list-view"}`}>
                                        {products.map(product => (
                                            <ProductListItem key={product.product_id} product={product} />
                                        ))}
                                    </div>
                                )}
                                {/* <div className={`list-grid-wrapper ${grid && "list-view"}`}>
                                    <div className="product-card h-100 p-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                                        <Link
                                            to="/product-details-two"
                                            className="product-card__thumb flex-center rounded-8 bg-gray-50 position-relative"
                                        >
                                            <img
                                                src="assets/images/thumbs/product-two-img1.png"
                                                alt=""
                                                className="w-auto max-w-unset"
                                            />
                                            <span className="product-card__badge bg-primary-600 px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0">
                                                Best Sale{" "}
                                            </span>
                                        </Link>
                                        <div className="product-card__content mt-16">
                                            <h6 className="title text-lg fw-semibold mt-12 mb-8">
                                                <Link
                                                    to="/product-details-two"
                                                    className="link text-line-2"
                                                    tabIndex={0}
                                                >
                                                    Taylor Farms Broccoli Florets Vegetables
                                                </Link>
                                            </h6>
                                            <div className="flex-align mb-20 mt-16 gap-6">
                                                <span className="text-xs fw-medium text-gray-500">4.8</span>
                                                <span className="text-15 fw-medium text-warning-600 d-flex">
                                                    <i className="ph-fill ph-star" />
                                                </span>
                                                <span className="text-xs fw-medium text-gray-500">(17k)</span>
                                            </div>
                                            <div className="mt-8">
                                                <div
                                                    className="progress w-100 bg-color-three rounded-pill h-4"
                                                    role="progressbar"
                                                    aria-label="Basic example"
                                                    aria-valuenow={35}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                    <div
                                                        className="progress-bar bg-main-two-600 rounded-pill"
                                                        style={{ width: "35%" }}
                                                    />
                                                </div>
                                                <span className="text-gray-900 text-xs fw-medium mt-8">
                                                    Sold: 18/35
                                                </span>
                                            </div>
                                            <div className="product-card__price my-20">
                                                <span className="text-gray-400 text-md fw-semibold text-decoration-line-through">
                                                    $28.99
                                                </span>
                                                <span className="text-heading text-md fw-semibold ">
                                                    $14.99 <span className="text-gray-500 fw-normal">/Qty</span>{" "}
                                                </span>
                                            </div>
                                            <Link
                                                to="/cart"
                                                className="product-card__cart btn bg-gray-50 text-heading hover-bg-main-600 hover-text-white py-11 px-24 rounded-8 flex-center gap-8 fw-medium"
                                                tabIndex={0}
                                            >
                                                Add To Cart <i className="ph ph-shopping-cart" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="product-card h-100 p-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                                        <Link
                                            to="/product-details-two"
                                            className="product-card__thumb flex-center rounded-8 bg-gray-50 position-relative"
                                        >
                                            <img
                                                src="assets/images/thumbs/product-two-img2.png"
                                                alt=""
                                                className="w-auto max-w-unset"
                                            />
                                        </Link>
                                        <div className="product-card__content mt-16">
                                            <h6 className="title text-lg fw-semibold mt-12 mb-8">
                                                <Link
                                                    to="/product-details-two"
                                                    className="link text-line-2"
                                                    tabIndex={0}
                                                >
                                                    Taylor Farms Broccoli Florets Vegetables
                                                </Link>
                                            </h6>
                                            <div className="flex-align mb-20 mt-16 gap-6">
                                                <span className="text-xs fw-medium text-gray-500">4.8</span>
                                                <span className="text-15 fw-medium text-warning-600 d-flex">
                                                    <i className="ph-fill ph-star" />
                                                </span>
                                                <span className="text-xs fw-medium text-gray-500">(17k)</span>
                                            </div>
                                            <div className="mt-8">
                                                <div
                                                    className="progress w-100 bg-color-three rounded-pill h-4"
                                                    role="progressbar"
                                                    aria-label="Basic example"
                                                    aria-valuenow={35}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                    <div
                                                        className="progress-bar bg-main-two-600 rounded-pill"
                                                        style={{ width: "35%" }}
                                                    />
                                                </div>
                                                <span className="text-gray-900 text-xs fw-medium mt-8">
                                                    Sold: 18/35
                                                </span>
                                            </div>
                                            <div className="product-card__price my-20">
                                                <span className="text-gray-400 text-md fw-semibold text-decoration-line-through">
                                                    $28.99
                                                </span>
                                                <span className="text-heading text-md fw-semibold ">
                                                    $14.99 <span className="text-gray-500 fw-normal">/Qty</span>{" "}
                                                </span>
                                            </div>
                                            <Link
                                                to="/cart"
                                                className="product-card__cart btn bg-gray-50 text-heading hover-bg-main-600 hover-text-white py-11 px-24 rounded-8 flex-center gap-8 fw-medium"
                                                tabIndex={0}
                                            >
                                                Add To Cart <i className="ph ph-shopping-cart" />
                                            </Link>
                                        </div>
                                    </div>
                                </div> */}
                                {/* Pagination Start */}
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
                                            <li className="page-item active">
                                                <Link
                                                    className="page-link h-64 w-64 flex-center text-md rounded-8 fw-medium text-neutral-600 border border-gray-100"
                                                >
                                                    01
                                                </Link>
                                            </li>
                                            {[...Array(pagination.totalPages)].map((_, i) => {
                                                const page = i + 1;
                                                // Show first, last, current, and adjacent pages
                                                if (
                                                    page === 1 ||
                                                    page === pagination.totalPages ||
                                                    (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                                                ) {
                                                    return (
                                                        // <li
                                                        //     key={page}
                                                        //     className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}
                                                        // >
                                                        //     <button
                                                        //         className="page-link"
                                                        //         onClick={() => handleFilterChange('page', page)}
                                                        //     >
                                                        //         {page}
                                                        //     </button>
                                                        // </li>

                                                        <li className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                                                            <Link
                                                                key={page}
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
                                {/* Pagination End */}
                            </>
                        )}
                    </div>
                    {/* Content End */}
                </div>
            </div>
        </section>

    )
}

// Product Card Component (Grid View)
const ProductCard = ({ product }) => {
    return (
        // <Link to={`/products/${product.product_id}`}>
        //     <div className="product-card__thumb position-relative">
        //         <img
        //             src={product.images?.[0]?.image_url ? `${process.env.REACT_APP_API_URL}${product.images[0].image_url}` : '/placeholder.jpg'}
        //             alt={product.product_name}
        //             className="w-100"
        //             style={{ height: '250px', objectFit: 'cover' }}
        //         />

        //         {/* Badges */}
        //         <div className="position-absolute top-0 start-0 m-12">
        //             {product.stock_quantity === 0 && (
        //                 <span className="badge bg-danger">Out of Stock</span>
        //             )}
        //             {product.stock_quantity > 0 && product.stock_quantity < 10 && (
        //                 <span className="badge bg-warning">Low Stock</span>
        //             )}
        //         </div>

        //         {/* Quick Actions */}
        //         <div className="position-absolute top-0 end-0 m-12">
        //             <button className="btn btn-sm btn-light rounded-circle mb-8">
        //                 <i className="ph ph-heart"></i>
        //             </button>
        //         </div>
        //     </div>

        //     <div className="p-16">
        //         {/* Category */}
        //         {product.category && (
        //             <div className="text-xs text-gray-500 mb-8">
        //                 {product.category.category_name}
        //             </div>
        //         )}

        //         {/* Title */}
        //         <h6 className="product-card__title text-line-2 mb-12">
        //             {product.product_name}
        //         </h6>

        //         {/* Store */}
        //         {product.store && (
        //             <div className="flex-align gap-8 mb-12">
        //                 {product.store.logo_url && (
        //                     <img
        //                         src={`${process.env.REACT_APP_API_URL}${product.store.logo_url}`}
        //                         alt={product.store.store_name}
        //                         className="rounded-circle"
        //                         style={{ width: '20px', height: '20px', objectFit: 'cover' }}
        //                     />
        //                 )}
        //                 <span className="text-sm text-gray-600">{product.store.store_name}</span>
        //             </div>
        //         )}

        //         {/* Price & Stats */}
        //         <div className="flex-between align-items-end">
        //             <div>
        //                 <div className="text-main-600 fw-bold text-xl">
        //                     {parseInt(product.price).toLocaleString('vi-VN')}đ
        //                 </div>
        //                 <div className="text-xs text-gray-500">
        //                     <i className="ph ph-shopping-bag-open me-4"></i>
        //                     Sold: {product.sold_quantity || 0}
        //                 </div>
        //             </div>
        //             <button className="btn btn-sm btn-main">
        //                 <i className="ph ph-shopping-cart"></i>
        //             </button>
        //         </div>
        //     </div>
        // </Link>
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
                {/* <span className="product-card__badge bg-primary-600 px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0">
                    Best Sale{" "}
                </span> */}
            </Link>
            <div className="product-card__content mt-16">
                <h6 className="title text-lg fw-semibold mt-12 mb-8">
                    <Link
                        to={`/products/${product.product_id}`}
                        className="link text-line-2"
                        tabIndex={0}
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
                        aria-label="Basic example"
                        aria-valuenow={35}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="progress-bar bg-main-two-600 rounded-pill"
                            style={{ width: "35%" }}
                        />
                    </div>
                    <span className="text-gray-900 text-xs fw-medium mt-8">
                        Sold: {product.sold_quantity}/{product.stock_quantity}
                    </span>
                </div>
                <div className="product-card__price my-20">
                    {/* <span className="text-gray-400 text-md fw-semibold text-decoration-line-through">
                        $28.99
                    </span> */}
                    <span className="text-heading text-md fw-semibold ">
                        ${product.price} <span className="text-gray-500 fw-normal">/Qty</span>{" "}
                    </span>
                </div>
                <Link
                    to="/cart"
                    className="product-card__cart btn bg-gray-50 text-heading hover-bg-main-600 hover-text-white py-11 px-24 rounded-8 flex-center gap-8 fw-medium"
                    tabIndex={0}
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
        // <div className="border border-gray-100 rounded-16 p-24 hover-border-main-600 transition-1">
        //     <Link to={`/products/${product.product_id}`} className="row align-items-center">
        //         <div className="col-lg-3 col-md-4">
        //             <img
        //                 src={product.images?.[0]?.image_url ? `${process.env.REACT_APP_API_URL}${product.images[0].image_url}` : '/placeholder.jpg'}
        //                 alt={product.product_name}
        //                 className="w-100 rounded-8"
        //                 style={{ height: '150px', objectFit: 'cover' }}
        //             />
        //         </div>
        //         <div className="col-lg-6 col-md-5">
        //             <div className="text-xs text-gray-500 mb-8">
        //                 {product.category?.category_name}
        //             </div>
        //             <h6 className="mb-8">{product.product_name}</h6>
        //             <p className="text-gray-600 text-sm text-line-2 mb-12">
        //                 {product.description || 'No description available'}
        //             </p>
        //             {product.store && (
        //                 <div className="flex-align gap-8">
        //                     <i className="ph ph-storefront text-gray-500"></i>
        //                     <span className="text-sm">{product.store.store_name}</span>
        //                 </div>
        //             )}
        //         </div>
        //         <div className="col-lg-3 col-md-3 text-lg-end mt-24 mt-md-0">
        //             <div className="text-main-600 fw-bold text-2xl mb-8">
        //                 {parseInt(product.price).toLocaleString('vi-VN')}đ
        //             </div>
        //             <div className="text-sm text-gray-500 mb-16">
        //                 <i className="ph ph-package me-4"></i>
        //                 Stock: {product.stock_quantity}
        //             </div>
        //             <div className="text-sm text-gray-500 mb-16">
        //                 <i className="ph ph-shopping-bag me-4"></i>
        //                 Sold: {product.sold_quantity || 0}
        //             </div>
        //             <button className="btn btn-main w-100">
        //                 <i className="ph ph-shopping-cart me-8"></i>
        //                 Add to Cart
        //             </button>
        //         </div>
        //     </Link>
        // </div>
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
                {/* <span className="product-card__badge bg-primary-600 px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0">
                    Best Sale{" "}
                </span> */}
            </Link>
            <div className="product-card__content mt-16">
                <h6 className="title text-lg fw-semibold mt-12 mb-8">
                    <Link
                        to={`/products/${product.product_id}`}
                        className="link text-line-2"
                        tabIndex={0}
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
                        aria-label="Basic example"
                        aria-valuenow={35}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="progress-bar bg-main-two-600 rounded-pill"
                            style={{ width: "35%" }}
                        />
                    </div>
                    <span className="text-gray-900 text-xs fw-medium mt-8">
                        Sold: {product.sold_quantity}/{product.stock_quantity}
                    </span>
                </div>
                <div className="product-card__price my-20">
                    {/* <span className="text-gray-400 text-md fw-semibold text-decoration-line-through">
                        $28.99
                    </span> */}
                    <span className="text-heading text-md fw-semibold ">
                        ${product.price} <span className="text-gray-500 fw-normal">/Qty</span>{" "}
                    </span>
                </div>
                <Link
                    to="/cart"
                    className="product-card__cart btn bg-gray-50 text-heading hover-bg-main-600 hover-text-white py-11 px-24 rounded-8 flex-center gap-8 fw-medium"
                    tabIndex={0}
                >
                    Add To Cart <i className="ph ph-shopping-cart" />
                </Link>
            </div>
        </div>
    );
};

export default ProductList;