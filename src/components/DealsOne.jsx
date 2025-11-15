import React, { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { getCountdown } from '../helper/Countdown';
import { toast } from 'react-toastify';

import productService from '../services/productService';
import ProductCard from './product/ProductCard';

// THÊM MỚI: Component Skeleton (bạn có thể import từ file riêng)
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


const SampleNextArrow = memo(function SampleNextArrow(props) {
    const { className, onClick } = props;
    return (
        <button
            type="button" onClick={onClick}
            className={` ${className} slick-next slick-arrow flex-center rounded-circle border border-gray-100 hover-border-neutral-600 text-xl hover-bg-neutral-600 hover-text-white transition-1`}
        >
            <i className="ph ph-caret-right" />
        </button>
    );
});

const SamplePrevArrow = memo(function SamplePrevArrow(props) {
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
});

const DealsOne = () => {
    const [timeLeft, setTimeLeft] = useState(getCountdown());

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getCountdown());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // THÊM MỚI: useEffect để gọi API "Deals"
    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const response = await productService.getDealProducts();
                if (response.success) {
                    setProducts(response.data);
                }
            } catch (error) {
                toast.error('Failed to load deals');
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
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
                breakpoint: 1599,
                settings: {
                    slidesToShow: 1,

                },
            },
            {
                breakpoint: 1399,
                settings: {
                    slidesToShow: 1,

                },
            },
            {
                breakpoint: 1199,
                settings: {
                    slidesToShow: 1,

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
        <section className="deals-weeek pt-80">
            <div className="container container-lg">
                <div className="border border-gray-100 p-24 rounded-16">
                    <div className="section-heading mb-24">
                        <div className="flex-between flex-wrap gap-8">
                            <h5 className="mb-0">Deal of The Week</h5>
                            <div className="flex-align mr-point gap-16">
                                <Link
                                    to="/products"
                                    className="text-sm fw-medium text-gray-700 hover-text-main-600 hover-text-decoration-underline"
                                >
                                    View All Deals
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="deal-week-box rounded-16 overflow-hidden flex-between position-relative z-1 mb-24">
                        <img
                            src="assets/images/bg/week-deal-bg.png"
                            alt=""
                            className="position-absolute inset-block-start-0 inset-block-start-0 w-100 h-100 z-n1 object-fit-cover"
                        />
                        <div className="d-lg-block d-none ps-32 flex-shrink-0">
                            <img src="assets/images/thumbs/week-deal-img1.png" alt="" />
                        </div>
                        <div className="deal-week-box__content px-sm-4 d-block w-100 text-center">
                            <h6 className="mb-20">Apple AirPods Max, Over Ear Headphones</h6>
                            <div className="countdown mt-20" id="countdown4">
                                <ul className="countdown-list style-four flex-center flex-wrap">
                                    <li className="countdown-list__item flex-align flex-column text-sm fw-medium text-white rounded-circle bg-neutral-600">
                                        <span className="days" />
                                        {timeLeft.days} <br /> Days
                                    </li>
                                    <li className="countdown-list__item flex-align flex-column text-sm fw-medium text-white rounded-circle bg-neutral-600">
                                        <span className="hours" />
                                        {timeLeft.hours} <br /> Hour
                                    </li>
                                    <li className="countdown-list__item flex-align flex-column text-sm fw-medium text-white rounded-circle bg-neutral-600">
                                        <span className="minutes" />
                                        {timeLeft.minutes} <br /> Min
                                    </li>
                                    <li className="countdown-list__item flex-align flex-column text-sm fw-medium text-white rounded-circle bg-neutral-600">
                                        <span className="seconds" />
                                        {timeLeft.seconds} <br /> Sec
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="d-lg-block d-none flex-shrink-0 pe-xl-5">
                            <div className="me-xxl-5">
                                <img src="assets/images/thumbs/week-deal-img2.png" alt="" />
                            </div>
                        </div>
                    </div>
                    <div className="deals-week-slider arrow-style-two">
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
        </section>

    )
}

export default DealsOne