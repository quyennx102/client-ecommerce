import React, { useEffect, useState } from 'react'
import query from 'jquery';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProductSection from "../components/home/ProductSection";
import './HeaderTwo.css';
import NotificationBell from './NotificationBell';

const HeaderTwo = ({ category }) => {
    const { user, isAuthenticated, logout, isAdmin, isSeller, updateTrigger, cartCount } = useAuth();
    const [scroll, setScroll] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        window.onscroll = () => {
            if (window.pageYOffset < 150) {
                setScroll(false);
            } else if (window.pageYOffset > 150) {
                setScroll(true);
            }
            return () => (window.onscroll = null);
        };
        const selectElement = query('.js-example-basic-single');
        selectElement.select2();

        return () => {
            if (selectElement.data('select2')) {
                selectElement.select2('destroy');
            }
        };
    }, [updateTrigger, isAuthenticated, user]);

    // Set the default language
    const [selectedLanguage, setSelectedLanguage] = useState("Eng");
    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
    };

    // Set the default currency
    const [selectedCurrency, setSelectedCurrency] = useState("USD");
    const handleCurrencyChange = (currency) => {
        setSelectedCurrency(currency);
    };

    // Mobile menu support
    const [menuActive, setMenuActive] = useState(false)
    const [activeIndex, setActiveIndex] = useState(null);
    const handleMenuClick = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };
    const handleMenuToggle = () => {
        setMenuActive(!menuActive);
    };

    // Search control support
    const [activeSearch, setActiveSearch] = useState(false)
    const handleSearchToggle = () => {
        setActiveSearch(!activeSearch);
    };

    // category control support
    const [activeCategory, setActiveCategory] = useState(false)
    const handleCategoryToggle = () => {
        setActiveCategory(!activeCategory);
    };
    const [activeIndexCat, setActiveIndexCat] = useState(null);
    const handleCatClick = (index) => {
        setActiveIndexCat(activeIndexCat === index ? null : index);
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        setMenuActive(false);
        navigate('/');
    };

    // Hàm xác định class active cho NavLink
    const getNavLinkClass = ({ isActive }) => {
        return isActive ? "nav-menu__link activePage" : "nav-menu__link";
    };

    return (
        <>
            <div className="overlay" />
            <div className={`side-overlay ${(menuActive || activeCategory) && "show"}`} />

            {/* ==================== Search Box Start Here ==================== */}
            <form action="#" className={`search-box ${activeSearch && "active"}`}>
                <button onClick={handleSearchToggle}
                    type="button"
                    className="search-box__close position-absolute inset-block-start-0 inset-inline-end-0 m-16 w-48 h-48 border border-gray-100 rounded-circle flex-center text-white hover-text-gray-800 hover-bg-white text-2xl transition-1"
                >
                    <i className="ph ph-x" />
                </button>
                <div className="container">
                    <div className="position-relative">
                        <input
                            type="text"
                            className="form-control py-16 px-24 text-xl rounded-pill pe-64"
                            placeholder="Search for a product or brand"
                        />
                        <button
                            type="submit"
                            className="w-48 h-48 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8"
                        >
                            <i className="ph ph-magnifying-glass" />
                        </button>
                    </div>
                </div>
            </form>
            {/* ==================== Search Box End Here ==================== */}

            {/* ==================== Mobile Menu Start Here ==================== */}
            <div className={`mobile-menu scroll-sm d-lg-none d-block ${menuActive && "active"}`}>
                <button onClick={() => { handleMenuToggle(); setActiveIndex(null) }} type="button" className="close-button">
                    <i className="ph ph-x" />{" "}
                </button>
                <div className="mobile-menu__inner">
                    <Link to="/" className="mobile-menu__logo">
                        <img src="/assets/images/logo/logo.png" alt="Logo" />
                    </Link>

                    {/* User Info in Mobile Menu */}
                    {isAuthenticated && (
                        <div className="mobile-user-info bg-main-50 p-3 rounded-8 mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <i className="ph ph-user text-main-600"></i>
                                <div>
                                    <div className="fw-medium text-dark">{user?.full_name}</div>
                                    <span className={`badge ${user?.role === 'admin' ? 'bg-danger' :
                                        user?.role === 'seller' ? 'bg-warning text-dark' : 'bg-secondary'
                                        } text-xs`}>
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mobile-menu__menu">
                        {/* Nav Menu Start */}
                        <ul className="nav-menu flex-align nav-menu--mobile">
                            <li onClick={() => handleMenuClick(0)}
                                className={`on-hover-item nav-menu__item has-submenu ${activeIndex === 0 ? "d-block" : ""}`}
                            >
                                <Link to="#" className="nav-menu__link">
                                    Home
                                </Link>
                                <ul className={`on-hover-dropdown common-dropdown nav-submenu scroll-sm ${activeIndex === 0 ? "open" : ""}`}>
                                    <li className="common-dropdown__item nav-submenu__item">
                                        <Link onClick={() => setActiveIndex(null)}
                                            to="/"
                                            className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                        >
                                            Home One
                                        </Link>
                                    </li>
                                    <li className="common-dropdown__item nav-submenu__item">
                                        <Link onClick={() => setActiveIndex(null)}
                                            to="/index-two"
                                            className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                        >
                                            Home Two
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            <li onClick={() => handleMenuClick(1)}
                                className={`on-hover-item nav-menu__item has-submenu ${activeIndex === 1 ? "d-block" : ""}`}
                            >
                                <Link to="#" className="nav-menu__link">
                                    Shop
                                </Link>
                                <ul className={`on-hover-dropdown common-dropdown nav-submenu scroll-sm ${activeIndex === 1 ? "open" : ""}`}>
                                    <li className="common-dropdown__item nav-submenu__item">
                                        <Link onClick={() => setActiveIndex(null)}
                                            to="/products"
                                            className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                        >
                                            Shop
                                        </Link>
                                    </li>
                                    <li className="common-dropdown__item nav-submenu__item">
                                        <Link onClick={() => setActiveIndex(null)}
                                            to="/product-details"
                                            className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                        >
                                            Shop Details
                                        </Link>
                                    </li>
                                    <li className="common-dropdown__item nav-submenu__item">
                                        <Link onClick={() => setActiveIndex(null)}
                                            to="/product-details-two"
                                            className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                        >
                                            Shop Details Two
                                        </Link>
                                    </li>
                                </ul>
                            </li>

                            {/* Seller Menu in Mobile */}
                            {isSeller() && (
                                <li onClick={() => handleMenuClick(4)}
                                    className={`on-hover-item nav-menu__item has-submenu ${activeIndex === 4 ? "d-block" : ""}`}
                                >
                                    <Link to="#" className="nav-menu__link text-warning">
                                        Seller
                                    </Link>
                                    <ul className={`on-hover-dropdown common-dropdown nav-submenu scroll-sm ${activeIndex === 4 ? "open" : ""}`}>
                                        <li className="common-dropdown__item nav-submenu__item">
                                            <Link onClick={() => setActiveIndex(null)}
                                                to="/seller/dashboard"
                                                className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                            >
                                                Dashboard
                                            </Link>
                                        </li>
                                        <li className="common-dropdown__item nav-submenu__item">
                                            <Link onClick={() => setActiveIndex(null)}
                                                to="/seller/stores"
                                                className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                            >
                                                My Stores
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            )}

                            {/* Admin Menu in Mobile */}
                            {isAdmin() && (
                                <li onClick={() => handleMenuClick(5)}
                                    className={`on-hover-item nav-menu__item has-submenu ${activeIndex === 5 ? "d-block" : ""}`}
                                >
                                    <Link to="#" className="nav-menu__link text-danger">
                                        Admin
                                    </Link>
                                    <ul className={`on-hover-dropdown common-dropdown nav-submenu scroll-sm ${activeIndex === 5 ? "open" : ""}`}>
                                        <li className="common-dropdown__item nav-submenu__item">
                                            <Link onClick={() => setActiveIndex(null)}
                                                to="/admin/dashboard"
                                                className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                            >
                                                Dashboard
                                            </Link>
                                        </li>
                                        <li className="common-dropdown__item nav-submenu__item">
                                            <Link onClick={() => setActiveIndex(null)}
                                                to="/admin/products"
                                                className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                            >
                                                Products
                                            </Link>
                                        </li>
                                        <li className="common-dropdown__item nav-submenu__item">
                                            <Link onClick={() => setActiveIndex(null)}
                                                to="/admin/category"
                                                className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                            >
                                                Categories
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            )}

                            <li onClick={() => handleMenuClick(2)}
                                className={`on-hover-item nav-menu__item has-submenu ${activeIndex === 2 ? "d-block" : ""}`}
                            >
                                <span className="badge-notification bg-warning-600 text-white text-sm py-2 px-8 rounded-4">
                                    New
                                </span>
                                <Link to="#" className="nav-menu__link">
                                    Pages
                                </Link>
                                <ul className={`on-hover-dropdown common-dropdown nav-submenu scroll-sm ${activeIndex === 2 ? "open" : ""}`}>
                                    <li className="common-dropdown__item nav-submenu__item">
                                        <Link onClick={() => setActiveIndex(null)}
                                            to="/cart"
                                            className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                        >
                                            Cart
                                        </Link>
                                    </li>
                                    <li className="common-dropdown__item nav-submenu__item">
                                        <Link onClick={() => setActiveIndex(null)}
                                            to="/checkout"
                                            className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                        >
                                            Checkout
                                        </Link>
                                    </li>
                                    <li className="common-dropdown__item nav-submenu__item">
                                        <Link onClick={() => setActiveIndex(null)}
                                            to="/profile"
                                            className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                        >
                                            Profile
                                        </Link>
                                    </li>
                                    {!isAuthenticated && (
                                        <li className="common-dropdown__item nav-submenu__item">
                                            <Link onClick={() => setActiveIndex(null)}
                                                to="/auth"
                                                className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                            >
                                                Account
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </li>
                            <li onClick={() => handleMenuClick(3)}
                                className={`on-hover-item nav-menu__item has-submenu ${activeIndex === 3 ? "d-block" : ""}`}
                            >
                                <Link to="#" className="nav-menu__link">
                                    Blog
                                </Link>
                                <ul className={`on-hover-dropdown common-dropdown nav-submenu scroll-sm ${activeIndex === 3 ? "open" : ""}`}>
                                    <li className="common-dropdown__item nav-submenu__item">
                                        <Link onClick={() => setActiveIndex(null)}
                                            to="/blog"
                                            className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                        >
                                            Blog
                                        </Link>
                                    </li>
                                    <li className="common-dropdown__item nav-submenu__item">
                                        <Link onClick={() => setActiveIndex(null)}
                                            to="/blog-details"
                                            className="common-dropdown__link nav-submenu__link hover-bg-neutral-100"
                                        >
                                            Blog Details
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-menu__item">
                                <Link to="/contact" className="nav-menu__link">
                                    Contact Us
                                </Link>
                            </li>

                            {/* Become a Seller Link in Mobile - CHỈ hiện khi CHƯA phải seller và đã đăng nhập */}
                            {isAuthenticated && !isSeller() && !isAdmin() && (
                                <li className="nav-menu__item">
                                    <Link
                                        to="/seller/register"
                                        className="nav-menu__link text-success"
                                        onClick={() => setActiveIndex(null)}
                                    >
                                        <i className="ph ph-storefront me-2"></i>
                                        Become a Seller
                                    </Link>
                                </li>
                            )}

                            {/* Authentication Links in Mobile */}
                            {isAuthenticated ? (
                                <>
                                    <li className="nav-menu__item">
                                        <Link to="/profile" className="nav-menu__link">
                                            <i className="ph ph-user me-2"></i>
                                            My Profile
                                        </Link>
                                    </li>
                                    <li className="nav-menu__item">
                                        <button
                                            onClick={handleLogout}
                                            className="nav-menu__link text-danger border-0 bg-transparent w-100 text-start"
                                        >
                                            <i className="ph ph-sign-out me-2"></i>
                                            Logout
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <li className="nav-menu__item">
                                    <Link to="/auth" className="nav-menu__link text-main-600">
                                        <i className="ph ph-sign-in me-2"></i>
                                        Login / Register
                                    </Link>
                                </li>
                            )}
                        </ul>
                        {/* Nav Menu End */}
                    </div>
                </div>
            </div>
            {/* ==================== Mobile Menu End Here ==================== */}

            {/* ======================= Middle Header Two Start ========================= */}
            <header className="header-middle style-two bg-color-neutral">
                <div className="container container-lg">
                    <nav className="header-inner flex-between">
                        {/* Logo Start */}
                        <div className="logo">
                            <Link to="/" className="link">
                                <img src="/assets/images/logo/logo-two.png" alt="Logo" />
                            </Link>
                        </div>
                        {/* Logo End  */}

                        {/* form Category Start */}
                        <div className="flex-align gap-16">
                            <div className="select-dropdown-for-home-two d-lg-none d-block">
                                {/* Language & Currency Dropdown */}
                            </div>
                            <form action="#" className="flex-align flex-wrap form-location-wrapper">
                                <div className="search-category style-two d-flex h-48 search-form d-sm-flex d-none">
                                    <select defaultValue={1}
                                        className="js-example-basic-single border border-gray-200 border-end-0 rounded-0 border-0"
                                        name="state"
                                    >
                                        <option value={1}>All Categories</option>
                                        <option value={1}>Grocery</option>
                                        <option value={1}>Breakfast &amp; Dairy</option>
                                        <option value={1}>Vegetables</option>
                                        <option value={1}>Milks and Dairies</option>
                                        <option value={1}>Pet Foods &amp; Toy</option>
                                        <option value={1}>Breads &amp; Bakery</option>
                                        <option value={1}>Fresh Seafood</option>
                                        <option value={1}>Fronzen Foods</option>
                                        <option value={1}>Noodles &amp; Rice</option>
                                        <option value={1}>Ice Cream</option>
                                    </select>
                                    <div className="search-form__wrapper position-relative">
                                        <input
                                            type="text"
                                            className="search-form__input common-input py-13 ps-16 pe-18 rounded-0 border-0"
                                            placeholder="Search for a product or brand"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-main-two-600 flex-center text-xl text-white flex-shrink-0 w-48 hover-bg-main-two-700 d-lg-flex d-none"
                                    >
                                        <i className="ph ph-magnifying-glass" />
                                    </button>
                                </div>
                            </form>
                        </div>
                        {/* form Category start */}

                        {/* Header Middle Right start */}
                        <div className="header-right flex-align d-lg-block d-none">
                            <div className="header-two-activities flex-align flex-wrap gap-32">
                                <button
                                    type="button"
                                    className="flex-align search-icon d-lg-none d-flex gap-4 item-hover-two"
                                    onClick={handleSearchToggle}
                                >
                                    <span className="text-2xl text-white d-flex position-relative item-hover__text">
                                        <i className="ph ph-magnifying-glass" />
                                    </span>
                                </button>

                                {/* Become a Seller Button - CHỈ hiện khi CHƯA phải seller và đã đăng nhập */}
                                {isAuthenticated && !isSeller() && !isAdmin() && (
                                    <Link
                                        to="/seller/register"
                                        className="flex-align flex-column gap-8 item-hover-two"
                                    >
                                        <span className="text-2xl text-white d-flex position-relative item-hover__text">
                                            <i className="ph ph-storefront" />
                                        </span>
                                        <span className="text-md text-white item-hover__text d-none d-lg-flex">
                                            Become Seller
                                        </span>
                                    </Link>
                                )}

                                {/* Notification Bell - Only when authenticated */}
                                {isAuthenticated && <NotificationBell />}

                                <Link
                                    to="/cart"
                                    className="flex-align flex-column gap-8 item-hover-two"
                                >
                                    <span className="text-2xl text-white d-flex position-relative me-6 mt-6 item-hover__text">
                                        <i className="ph ph-shopping-cart-simple" />
                                        {cartCount > 0 && (
                                            <span className="w-16 h-16 flex-center rounded-circle bg-main-two-600 text-white text-xs position-absolute top-n6 end-n4">
                                                {cartCount > 99 ? '99+' : cartCount}
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-md text-white item-hover__text d-none d-lg-flex">
                                        Cart
                                    </span>
                                </Link>

                                {/* User Profile Dropdown */}
                                {isAuthenticated ? (
                                    <div className="dropdown">
                                        <button
                                            className="flex-align flex-column gap-8 item-hover-two border-0 bg-transparent"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                        >
                                            <span className="text-2xl text-white d-flex position-relative item-hover__text">
                                                <i className="ph ph-user" />
                                            </span>
                                            <span className="text-md text-white item-hover__text d-none d-lg-flex">
                                                {user?.full_name?.split(' ')[0] || 'Profile'}
                                            </span>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end" style={{ width: '200px' }}>
                                            <li>
                                                <span className="dropdown-item-text">
                                                    <small className="text-muted">Signed in as</small>
                                                    <div className="fw-medium">{user?.full_name}</div>
                                                    <span className={`badge ${user?.role === 'admin' ? 'bg-danger' :
                                                        user?.role === 'seller' ? 'bg-warning text-dark' : 'bg-secondary'
                                                        }`}>
                                                        {user?.role}
                                                    </span>
                                                </span>
                                            </li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <Link className="dropdown-item" to="/profile">
                                                    <i className="ph ph-user me-2"></i>
                                                    My Profile
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className="dropdown-item" to="/cart">
                                                    <i className="ph ph-shopping-cart me-2"></i>
                                                    My Cart
                                                </Link>
                                            </li>

                                            {/* Become a Seller trong dropdown - CHỈ khi CHƯA phải seller */}
                                            {!isSeller() && !isAdmin() && (
                                                <>
                                                    <li><hr className="dropdown-divider" /></li>
                                                    <li>
                                                        <Link className="dropdown-item text-success" to="/seller/register">
                                                            <i className="ph ph-storefront me-2"></i>
                                                            Become a Seller
                                                        </Link>
                                                    </li>
                                                </>
                                            )}

                                            {/* Role-specific dropdown items */}
                                            {isSeller() && (
                                                <>
                                                    <li><hr className="dropdown-divider" /></li>
                                                    <li className="dropdown-header text-warning">Seller Tools</li>
                                                    <li>
                                                        <Link className="dropdown-item" to="/seller/dashboard">
                                                            <i className="ph ph-gauge me-2"></i>
                                                            Seller Dashboard
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link className="dropdown-item" to="/seller/stores">
                                                            <i className="ph ph-storefront me-2"></i>
                                                            My Stores
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link className="dropdown-item" to="/seller/products">
                                                            <i className="ph ph-package me-2"></i>
                                                            My Products
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link className="dropdown-item" to="/seller/orders">
                                                            <i className="ph ph-shopping-cart me-2"></i>
                                                            Orders
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link className="dropdown-item" to="/seller/revenue">
                                                            <i className="ph ph-currency-dollar me-2"></i>
                                                            Revenue
                                                        </Link>
                                                    </li>
                                                </>
                                            )}

                                            {isAdmin() && (
                                                <>
                                                    <li><hr className="dropdown-divider" /></li>
                                                    <li className="dropdown-header text-danger">Admin Tools</li>
                                                    <li>
                                                        <Link className="dropdown-item" to="/admin/dashboard">
                                                            <i className="ph ph-gauge me-2"></i>
                                                            Admin Dashboard
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link className="dropdown-item" to="/admin/users">
                                                            <i className="ph ph-users me-2"></i>
                                                            Manage Users
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link className="dropdown-item" to="/admin/products">
                                                            <i className="ph ph-package me-2"></i>
                                                            Manage Products
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link className="dropdown-item" to="/admin/category">
                                                            <i className="ph ph-tag me-2"></i>
                                                            Manage Categories
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link className="dropdown-item" to="/admin/transactions">
                                                            <i className="ph ph-currency-dollar me-2"></i>
                                                            Transactions
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link className="dropdown-item" to="/admin/discounts">
                                                            <i className="ph ph-ticket me-2"></i>
                                                            Manage Discounts
                                                        </Link>
                                                    </li>
                                                </>
                                            )}

                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button
                                                    className="dropdown-item text-danger"
                                                    onClick={handleLogout}
                                                >
                                                    <i className="ph ph-sign-out me-2"></i>
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                ) : (
                                    <Link
                                        to="/auth"
                                        className="flex-align flex-column gap-8 item-hover-two"
                                    >
                                        <span className="text-2xl text-white d-flex position-relative item-hover__text">
                                            <i className="ph ph-sign-in"></i>
                                        </span>
                                        <span className="text-md text-white item-hover__text d-none d-lg-flex">
                                            Sign-in
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </div>
                        {/* Header Middle Right End  */}
                    </nav>
                </div>
            </header>
            {/* ======================= Middle Header Two End ========================= */}

            {/* ==================== Header Two Start Here ==================== */}
            <header className={`header bg-white border-bottom border-gray-100 ${scroll && "fixed-header"}`}>
                <div className="container container-lg">
                    <nav className="header-inner d-flex justify-content-between gap-8">
                        <div className="flex-align menu-category-wrapper">
                            {/* Menu Start  */}
                            <div className="header-menu d-lg-block d-none">
                                {/* Nav Menu Start */}
                                <ul className="nav-menu flex-align">
                                    {/* Seller Menu in Desktop */}
                                    {isSeller() && (
                                        <>
                                            <li className="nav-menu__item">
                                                <NavLink to="/seller/dashboard" className={({ isActive }) =>
                                                    isActive ? "nav-menu__link activePage text-warning" : "nav-menu__link text-warning"
                                                }>
                                                    <i className="ph ph-gauge me-1"></i>
                                                    Dashboard
                                                </NavLink>
                                            </li>
                                            <li className="nav-menu__item">
                                                <NavLink to="/seller/stores" className={({ isActive }) =>
                                                    isActive ? "nav-menu__link activePage text-warning" : "nav-menu__link text-warning"
                                                }>
                                                    <i className="ph ph-storefront me-1"></i>
                                                    Stores
                                                </NavLink>
                                            </li>
                                            <li className="nav-menu__item">
                                                <NavLink to="/seller/products" className={({ isActive }) =>
                                                    isActive ? "nav-menu__link activePage text-warning" : "nav-menu__link text-warning"
                                                }>
                                                    <i className="ph ph-package me-1"></i>
                                                    Products
                                                </NavLink>
                                            </li>
                                            <li className="nav-menu__item">
                                                <NavLink to="/seller/orders" className={({ isActive }) =>
                                                    isActive ? "nav-menu__link activePage text-warning" : "nav-menu__link text-warning"
                                                }>
                                                    <i className="ph ph-shopping-cart me-1"></i>
                                                    Orders
                                                </NavLink>
                                            </li>
                                            <li className="nav-menu__item">
                                                <NavLink to="/seller/revenue" className={({ isActive }) =>
                                                    isActive ? "nav-menu__link activePage text-warning" : "nav-menu__link text-warning"
                                                }>
                                                    <i className="ph ph-currency-dollar me-1"></i>
                                                    Revenue
                                                </NavLink>
                                            </li>
                                        </>
                                    )}

                                    {/* Admin Menu in Desktop */}
                                    {isAdmin() && (
                                        <>
                                            <li className="nav-menu__item">
                                                <NavLink to="/admin/dashboard" className={({ isActive }) =>
                                                    isActive ? "nav-menu__link activePage text-danger" : "nav-menu__link text-danger"
                                                }>
                                                    <i className="ph ph-gauge me-1"></i>
                                                    Dashboard
                                                </NavLink>
                                            </li>
                                            <li className="nav-menu__item">
                                                <NavLink to="/admin/users" className={({ isActive }) =>
                                                    isActive ? "nav-menu__link activePage text-danger" : "nav-menu__link text-danger"
                                                }>
                                                    <i className="ph ph-users me-1"></i>
                                                    Users
                                                </NavLink>
                                            </li>
                                            <li className="nav-menu__item">
                                                <NavLink to="/admin/stores" className={({ isActive }) =>
                                                    isActive ? "nav-menu__link activePage text-danger" : "nav-menu__link text-danger"
                                                }>
                                                    <i className="ph ph-storefront me-1"></i>
                                                    Stores
                                                </NavLink>
                                            </li>
                                            <li className="nav-menu__item">
                                                <NavLink to="/admin/products" className={({ isActive }) =>
                                                    isActive ? "nav-menu__link activePage text-danger" : "nav-menu__link text-danger"
                                                }>
                                                    <i className="ph ph-package me-1"></i>
                                                    Products
                                                </NavLink>
                                            </li>
                                            <li className="nav-menu__item">
                                                <NavLink to="/admin/category" className={({ isActive }) =>
                                                    isActive ? "nav-menu__link activePage text-danger" : "nav-menu__link text-danger"
                                                }>
                                                    <i className="ph ph-tag me-1"></i>
                                                    Categories
                                                </NavLink>
                                            </li>
                                            <li className="nav-menu__item">
                                                <NavLink to="/admin/transactions" className={({ isActive }) =>
                                                    isActive ? "nav-menu__link activePage text-danger" : "nav-menu__link text-danger"
                                                }>
                                                    <i className="ph ph-currency-dollar me-1"></i>
                                                    Transactions
                                                </NavLink>
                                            </li>
                                            <li className="nav-menu__item">
                                                <NavLink to="/admin/discounts" className={({ isActive }) =>
                                                    isActive ? "nav-menu__link activePage text-danger" : "nav-menu__link text-danger"
                                                }>
                                                    <i className="ph ph-ticket me-1"></i>
                                                    Discounts
                                                </NavLink>
                                            </li>
                                        </>
                                    )}

                                    {/* Become a Seller Link - CHỈ hiện khi CHƯA phải seller và đã đăng nhập */}
                                    {/* {isAuthenticated && !isSeller() && !isAdmin() && (
                                        <li className="nav-menu__item">
                                            <NavLink to="/seller/register" className={({ isActive }) =>
                                                isActive ? "nav-menu__link activePage text-success" : "nav-menu__link text-success"
                                            }>
                                                <i className="ph ph-storefront me-1"></i>
                                                Become a Seller
                                            </NavLink>
                                        </li>
                                    )} */}
                                </ul>
                                {/* Nav Menu End */}
                            </div>
                            {/* Menu End  */}
                        </div>

                        {/* Header Right start */}
                        <div className="header-right flex-align">
                            <div className="me-8 d-lg-none d-block">
                                <button
                                    onClick={handleMenuToggle}
                                    type="button"
                                    className="toggle-mobileMenu flex-center text-white text-4xl d-flex d-lg-none"
                                >
                                    <i className="ph ph-list" />
                                </button>
                            </div>
                        </div>
                        {/* Header Right End  */}
                    </nav>
                </div>
            </header>
            {/* ==================== Header End Here ==================== */}
        </>
    )
}

export default HeaderTwo