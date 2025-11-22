import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import categoryService from '../services/categoryService';
import { toast } from 'react-toastify';

const BannerTwo = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const settings = {
        dots: true,
        arrows: true,
        autoplay: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getCategoryTree();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // Render category tree recursively
    const renderCategoryTree = (categoryList, level = 0) => {
        if (!categoryList || categoryList.length === 0) return null;

        return categoryList.map(category => (
            <li key={category.category_id} className="has-submenus-submenu">
                <Link
                    to={`/products?category=${category.category_id}`}
                    className="text-gray-500 text-15 py-12 px-16 flex-align gap-8 rounded-0"
                    style={{ paddingLeft: `${16 + (level * 16)}px` }}
                >
                    {category.icon_url && (
                        <img 
                            src={`${process.env.REACT_APP_IMAGE_URL}${category.icon_url}`}
                            alt={category.category_name}
                            style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                        />
                    )}
                    <span>{category.category_name}</span>
                    {category.subcategories && category.subcategories.length > 0 && (
                        <span className="icon text-md d-flex ms-auto">
                            <i className="ph ph-caret-right" />
                        </span>
                    )}
                </Link>
                
                {/* Render subcategories if exist */}
                {category.subcategories && category.subcategories.length > 0 && (
                    <div className="submenus-submenu py-16">
                        <h6 className="text-lg px-16 submenus-submenu__title">
                            {category.category_name}
                        </h6>
                        <ul className="submenus-submenu__list max-h-300 overflow-y-auto scroll-sm">
                            {category.subcategories.map(subcat => (
                                <li key={subcat.category_id}>
                                    <Link 
                                        to={`/products?category=${subcat.category_id}`}
                                        className="flex-align gap-8"
                                    >
                                        {subcat.icon_url && (
                                            <img 
                                                src={`${process.env.REACT_APP_IMAGE_URL}${subcat.icon_url}`}
                                                alt={subcat.category_name}
                                                style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                                            />
                                        )}
                                        {subcat.category_name}
                                    </Link>
                                    
                                    {/* Render nested subcategories if exist */}
                                    {subcat.subcategories && subcat.subcategories.length > 0 && (
                                        <ul className="nested-submenu ps-3">
                                            {subcat.subcategories.map(nestedCat => (
                                                <li key={nestedCat.category_id}>
                                                    <Link 
                                                        to={`/products?category=${nestedCat.category_id}`}
                                                        className="text-sm text-gray-600 hover-text-main-600"
                                                    >
                                                        {nestedCat.category_name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </li>
        ));
    };

    return (
        <div className="banner-two">
            <div className="container container-lg">
                <div className="banner-two-wrapper d-flex align-items-start">
                    {/* Category Sidebar */}
                    <div className="w-265 d-lg-block d-none flex-shrink-0">
                        <div className="responsive-dropdown style-two common-dropdown nav-submenu p-0 submenus-submenu-wrapper shadow-none border border-gray-100 position-relative border-top-0">
                            <button
                                type="button"
                                className="close-responsive-dropdown rounded-circle text-xl position-absolute inset-inline-end-0 inset-block-start-0 mt-4 me-8 d-lg-none d-flex"
                            >
                                <i className="ph ph-x" />
                            </button>
                            <div className="logo px-16 d-lg-none d-block">
                                <Link to="/" className="link">
                                    <img src="assets/images/logo/logo.png" alt="Logo" />
                                </Link>
                            </div>
                            
                            {loading ? (
                                <div className="text-center py-32">
                                    <div className="spinner-border spinner-border-sm text-main-600"></div>
                                    <p className="text-sm text-gray-500 mt-2">Loading categories...</p>
                                </div>
                            ) : (
                                <ul className="responsive-dropdown__list scroll-sm p-0 py-8 overflow-y-auto">
                                    {/* All Products Link */}
                                    <li>
                                        <Link
                                            to="/products"
                                            className="text-gray-500 text-15 py-12 px-16 flex-align gap-8 rounded-0"
                                        >
                                            <i className="ph ph-squares-four text-xl"></i>
                                            <span className="fw-semibold">All Products</span>
                                        </Link>
                                    </li>
                                    
                                    {/* Category Tree */}
                                    {renderCategoryTree(categories)}
                                    
                                    {categories.length === 0 && (
                                        <li className="text-center py-32">
                                            <p className="text-sm text-gray-500">No categories available</p>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Banner Slider */}
                    <div className="banner-item-two-wrapper rounded-24 overflow-hidden position-relative arrow-center flex-grow-1 mb-0">
                        <img
                            src="assets/images/bg/banner-two-bg.png"
                            alt=""
                            className="banner-img position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 z-n1 object-fit-cover rounded-24"
                        />
                        <div className="banner-item-two__slider">
                            <Slider {...settings}>
                                <div className="banner-item-two">
                                    <div className="banner-item-two__content">
                                        <h2 className="banner-item-two__title bounce text-white">
                                            Daily Grocery Order and Get Express Delivery
                                        </h2>
                                        <Link
                                            to="/products"
                                            className="btn btn-outline-white d-inline-flex align-items-center rounded-pill gap-8 mt-48"
                                        >
                                            Shop Now
                                            <span className="icon text-xl d-flex">
                                                <i className="ph ph-shopping-cart-simple" />
                                            </span>
                                        </Link>
                                    </div>
                                    <div className="banner-item-two__thumb position-absolute bottom-0">
                                        <img src="assets/images/thumbs/banner-two-img.png" alt="" />
                                    </div>
                                </div>
                                <div className="banner-item-two">
                                    <div className="banner-item-two__content">
                                        <h2 className="banner-item-two__title bounce text-white">
                                            Daily Grocery Order and Get Express Delivery
                                        </h2>
                                        <Link
                                            to="/products"
                                            className="btn btn-outline-white d-inline-flex align-items-center rounded-pill gap-8 mt-48"
                                        >
                                            Shop Now
                                            <span className="icon text-xl d-flex">
                                                <i className="ph ph-shopping-cart-simple" />
                                            </span>
                                        </Link>
                                    </div>
                                    <div className="banner-item-two__thumb position-absolute bottom-0">
                                        <img src="assets/images/thumbs/banner-two-img2.png" alt="" />
                                    </div>
                                </div>
                            </Slider>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerTwo;