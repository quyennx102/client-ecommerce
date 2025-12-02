import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { toast } from 'react-toastify';
import productService from '../services/productService';
import ProductCard from './product/ProductCard';

const RelatedProducts = ({ currentProductId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!currentProductId) return;
            
            try {
                setLoading(true);
                const response = await productService.getRelatedProducts(currentProductId, 12);
                
                if (response.success) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error('Failed to load related products:', error);
                // Don't show error toast to user, just fail silently
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedProducts();
    }, [currentProductId]);

    // Skeleton loader component
    const SkeletonCard = () => (
        <div className="product-card h-100 p-8 border border-gray-100 rounded-16">
            <div style={{ height: '200px', backgroundColor: '#f0f0f0', borderRadius: '8px', marginBottom: '16px' }}></div>
            <div style={{ height: '16px', width: '60%', backgroundColor: '#f0f0f0', marginBottom: '8px', borderRadius: '4px' }}></div>
            <div style={{ height: '20px', width: '90%', backgroundColor: '#f0f0f0', marginBottom: '12px', borderRadius: '4px' }}></div>
            <div style={{ height: '20px', width: '40%', backgroundColor: '#f0f0f0', marginBottom: '16px', borderRadius: '4px' }}></div>
            <div style={{ height: '40px', width: '100%', backgroundColor: '#f0f0f0', borderRadius: '8px' }}></div>
        </div>
    );

    // Slider navigation arrows
    function SampleNextArrow(props) {
        const { className, onClick } = props;
        return (
            <button
                type="button"
                onClick={onClick}
                className={`${className} slick-next slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1`}
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
                className={`${className} slick-prev slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1`}
            >
                <i className="ph ph-caret-left" />
            </button>
        );
    }

    const settings = {
        dots: false,
        arrows: true,
        infinite: products.length > 6,
        speed: 1000,
        slidesToShow: 6,
        slidesToScroll: 1,
        initialSlide: 0,
        autoplay: products.length > 6,
        autoplaySpeed: 3000,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 1599,
                settings: {
                    slidesToShow: 5,
                    infinite: products.length > 5,
                },
            },
            {
                breakpoint: 1399,
                settings: {
                    slidesToShow: 4,
                    infinite: products.length > 4,
                },
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                    infinite: products.length > 3,
                },
            },
            {
                breakpoint: 575,
                settings: {
                    slidesToShow: 2,
                    infinite: products.length > 2,
                },
            },
            {
                breakpoint: 424,
                settings: {
                    slidesToShow: 1,
                    infinite: products.length > 1,
                },
            },
        ],
    };

    // Don't render if no products and not loading
    if (!loading && products.length === 0) {
        return null;
    }

    return (
        <section className="new-arrival pb-80">
            <div className="container container-lg">
                <div className="section-heading">
                    <div className="flex-between flex-wrap gap-8">
                        <h5 className="mb-0">You Might Also Like</h5>
                        <div className="flex-align mr-point gap-16">
                            <Link
                                to="/products"
                                className="text-sm fw-medium text-gray-700 hover-text-main-600 hover-text-decoration-underline"
                            >
                                View All Products
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="new-arrival__slider arrow-style-two">
                    {loading ? (
                        // Loading skeleton
                        <Slider {...settings}>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="px-2">
                                    <SkeletonCard />
                                </div>
                            ))}
                        </Slider>
                    ) : (
                        // Actual products
                        <Slider {...settings}>
                            {products.map(product => (
                                <div key={product.product_id} className="px-2">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </Slider>
                    )}
                </div>
            </div>
        </section>
    );
};

export default RelatedProducts;