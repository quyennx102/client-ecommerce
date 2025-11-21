import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { toast } from 'react-toastify';
import productService from '../services/productService';
import ProductCard from './product/ProductCard';
const TopSellingOne = () => {
    const SkeletonCard = () => (
        <div className="product-card">
            <div className="product-card__img" style={{ height: '270px', backgroundColor: '#f0f0f0' }}></div>
            <div className="product-card__content">
                <div style={{ height: '16px', width: '30%', backgroundColor: '#f0f0f0', marginBottom: '8px' }}></div>
                <div style={{ height: '20px', width: '80%', backgroundColor: '#f0f0f0', marginBottom: '20px' }}></div>
                <div style={{ height: '20px', width: '40%', backgroundColor: '#f0f0f0', marginBottom: '24px' }}></div>
                <div style={{ height: '42px', width: '100%', backgroundColor: '#f0f0f0', borderRadius: '8px' }}></div>
            </div>
        </div>
    );
    function SampleNextArrow(props) {
        const { className, onClick } = props;
        return (
            <button
                type="button" onClick={onClick}
                className={` ${className} slick-next slick-arrow flex-center rounded-circle border border-gray-100 hover-border-neutral-600 text-xl hover-bg-neutral-600 hover-text-white transition-1`}
            >
                <i className="ph ph-caret-right" />
            </button>
        );
    }
    function SamplePrevArrow(props) {
        const { className, onClick } = props;

        return (

            <button
                type="button"
                onClick={onClick}
                className={`${className} slick-prev slick-arrow flex-center rounded-circle border border-gray-100 hover-border-neutral-600 text-xl hover-bg-neutral-600 hover-text-white transition-1`}
            >
                <i className="ph ph-caret-left" />
            </button>
        );
    }
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchTopSelling = async () => {
            try {
                const response = await productService.getTopSellingProducts();
                if (response.success) {
                    setProducts(response.data);
                }
            } catch (error) {
                toast.error('Failed to load top selling products');
            } finally {
                setLoading(false);
            }
        };

        fetchTopSelling();
    }, []);
    const settings = {
        dots: false,
        arrows: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
        autoplay: true,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 1399,
                settings: {
                    slidesToShow: 3,

                },
            },
            {
                breakpoint: 1199,
                settings: {
                    slidesToShow: 2,

                },
            },
            {
                breakpoint: 575,
                settings: {
                    slidesToShow: 1,

                },
            },

        ],
    };
    return (
        <section className="top-selling-products pt-80">
            <div className="container container-lg">
                <div className="border border-gray-100 p-24 rounded-16">
                    <div className="section-heading mb-24">
                        <div className="flex-between flex-wrap gap-8">
                            <h5 className="mb-0">Top Selling Products</h5>
                            <div className="flex-align mr-point gap-16">
                                <Link
                                    to="/shop"
                                    className="text-sm fw-medium text-gray-700 hover-text-main-600 hover-text-decoration-underline"
                                >
                                    View All Deals
                                </Link>

                            </div>
                        </div>
                    </div>
                    <div className="row g-12">
                        <div className="col-md-4">
                            <div className="position-relative rounded-16 overflow-hidden p-28 z-1 text-center">
                                <img
                                    src="assets/images/bg/deal-bg.png"
                                    alt=""
                                    className="position-absolute inset-block-start-0 inset-inline-start-0 z-n1 w-100 h-100"
                                />
                                <div className="py-xl-4">
                                    <h6 className="mb-4 fw-semibold">PTaylor Farms Broccoli Florets Vegetables</h6>
                                    <h5 className="mb-40 fw-semibold">Fresh Vegetables</h5>
                                    <Link
                                        to="/cart"
                                        className="btn text-heading border-neutral-600 hover-bg-neutral-600 hover-text-white py-16 px-24 flex-center d-inline-flex rounded-pill gap-8 fw-medium"
                                        tabIndex={0}
                                    >
                                        Shop Now <i className="ph ph-shopping-cart text-xl d-flex" />
                                    </Link>
                                </div>
                                <div className="d-md-block d-none mt-36">
                                    <img src="assets/images/thumbs/best-sell3.png" alt="" />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="top-selling-product-slider arrow-style-two">
                                <Slider {...settings}>
                                    {loading ? (
                                        // Hiển thị skeleton khi loading
                                        Array.from({ length: 4 }).map((_, index) => (
                                            <div key={index}>
                                                <SkeletonCard />
                                            </div>
                                        ))
                                    ) : (
                                        // Hiển thị sản phẩm thật
                                        products.map(product => (
                                            <div key={product.product_id}>
                                                <ProductCard product={product} />
                                            </div>
                                        ))
                                    )}
                                </Slider>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    )
}

export default TopSellingOne