import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import { toast } from 'react-toastify';
import { getCountdown } from '../helper/Countdown';
import productService from '../services/productService';
import cartService from '../services/cartService';
import reviewService from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';

const ProductDetailsTwo = () => {
    const { id } = useParams(); // Lấy product ID từ URL
    const [timeLeft, setTimeLeft] = useState(getCountdown());
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [ratingDistribution, setRatingDistribution] = useState([]);
    const { fetchCartCount } = useAuth();

    // Quantity state
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    // Review form state
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewForm, setReviewForm] = useState({
        title: '',
        content: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Image states
    const [mainImage, setMainImage] = useState('');
    const [productImages, setProductImages] = useState([]);

    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getCountdown());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch product details
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const response = await productService.getProductById(id);

                if (response.success) {
                    setProduct(response.data);

                    // Set images
                    if (response.data.images && response.data.images.length > 0) {
                        setProductImages(response.data.images);
                        const primaryImage = response.data.images.find(img => img.is_primary);
                        setMainImage(primaryImage?.image_url || response.data.images[0].image_url);
                    }
                } else {
                    toast.error('Failed to load product details');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoadingReviews(true);
                const response = await reviewService.getProductReviews(id);

                if (response.success) {
                    setReviews(response.data);

                    // Calculate rating distribution
                    const distribution = calculateRatingDistribution(response.data);
                    setRatingDistribution(distribution);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoadingReviews(false);
            }
        };

        if (id) {
            fetchReviews();
        }
    }, [id]);

    // Calculate rating distribution
    const calculateRatingDistribution = (reviewsData) => {
        const total = reviewsData.length;
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        reviewsData.forEach(review => {
            counts[review.rating]++;
        });

        return [
            { stars: 5, count: counts[5], percentage: total > 0 ? (counts[5] / total) * 100 : 0 },
            { stars: 4, count: counts[4], percentage: total > 0 ? (counts[4] / total) * 100 : 0 },
            { stars: 3, count: counts[3], percentage: total > 0 ? (counts[3] / total) * 100 : 0 },
            { stars: 2, count: counts[2], percentage: total > 0 ? (counts[2] / total) * 100 : 0 },
            { stars: 1, count: counts[1], percentage: total > 0 ? (counts[1] / total) * 100 : 0 }
        ];
    };

    // Quantity handlers
    const incrementQuantity = () => {
        if (product && quantity < product.stock_quantity) {
            setQuantity(quantity + 1);
        } else {
            toast.warning('Maximum stock reached');
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    // Add to cart handler
    const handleAddToCart = async () => {
        if (!product || product.stock_quantity === 0) {
            toast.error('Product is out of stock');
            return;
        }

        try {
            setAddingToCart(true);
            const response = await cartService.addToCart({
                product_id: product.product_id,
                quantity: quantity
            });

            if (response.success) {
                toast.success('Product added to cart successfully!');
                await fetchCartCount();
                // Dispatch event để update cart count
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                toast.error(response.message || 'Failed to add to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error(error.response?.data?.message || 'Failed to add product to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    // Buy now handler
    const handleBuyNow = async () => {
        await handleAddToCart();
        setTimeout(() => {
            window.location.href = '/cart';
        }, 1000);
    };

    // Submit review handler
    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!reviewForm.title || !reviewForm.content) {
            toast.error('Please fill in all review fields');
            return;
        }

        try {
            setSubmittingReview(true);
            const response = await reviewService.createReview(id, {
                rating: reviewRating,
                title: reviewForm.title,
                content: reviewForm.content
            });

            if (response.success) {
                toast.success('Review submitted successfully!');
                setReviewForm({ title: '', content: '' });
                setReviewRating(5);

                // Reload reviews
                const reviewsResponse = await reviewService.getProductReviews(id);
                if (reviewsResponse.success) {
                    setReviews(reviewsResponse.data);
                    const distribution = calculateRatingDistribution(reviewsResponse.data);
                    setRatingDistribution(distribution);
                }
            } else {
                toast.error(response.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    // Like review handler
    const handleLikeReview = async (reviewId) => {
        try {
            const response = await reviewService.likeReview(reviewId);

            if (response.success) {
                // Update local state
                setReviews(reviews.map(review =>
                    review.review_id === reviewId
                        ? { ...review, likes: (review.likes || 0) + 1 }
                        : review
                ));
                toast.success('Thank you for your feedback!');
            }
        } catch (error) {
            console.error('Error liking review:', error);
            toast.error('Failed to like review');
        }
    };

    // Calculate discount percentage
    const getDiscountPercentage = () => {
        if (product?.original_price && product?.price) {
            return Math.round(((product.original_price - product.price) / product.original_price) * 100);
        }
        return 0;
    };

    // Slider settings
    const settingsThumbs = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        focusOnSelect: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3
                }
            }
        ]
    };

    // Loading state
    if (loading) {
        return (
            <section className="product-details py-80">
                <div className="container container-lg">
                    <div className="text-center">
                        <div className="spinner-border text-main-600" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading product details...</p>
                    </div>
                </div>
            </section>
        );
    }

    // Product not found
    if (!product) {
        return (
            <section className="product-details py-80">
                <div className="container container-lg">
                    <div className="text-center">
                        <h4 className="mb-4">Product not found</h4>
                        <Link to="/shop" className="btn btn-main">Back to Shop</Link>
                    </div>
                </div>
            </section>
        );
    }

    const discountPercent = getDiscountPercentage();

    return (
        <section className="product-details py-80">
            <div className="container container-lg">
                <div className="row gy-4">
                    <div className="col-lg-9">
                        <div className="row gy-4">
                            <div className="col-xl-6">
                                <div className="product-details__left">
                                    <div className="product-details__thumb-slider border border-gray-100 rounded-16">
                                        <div className="">
                                            <div className="product-details__thumb flex-center h-100">
                                                <img src={`${process.env.REACT_APP_IMAGE_URL}${mainImage}`} alt={product.product_name} />
                                            </div>
                                        </div>
                                    </div>
                                    {productImages.length > 0 && (
                                        <div className="mt-24">
                                            <div className="product-details__images-slider">
                                                <Slider {...settingsThumbs}>
                                                    {productImages.map((image, index) => (
                                                        <div className="center max-w-120 max-h-120 h-100 flex-center border border-gray-100 rounded-16 p-8" key={index} onClick={() => setMainImage(image)}>
                                                            <img className='thum' src={`${process.env.REACT_APP_IMAGE_URL}${image.image_url}`} alt={`${product.product_name} ${index + 1}`} />
                                                        </div>
                                                    ))}
                                                </Slider>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-xl-6">
                                <div className="product-details__content">
                                    {/* Special Offer */}
                                    {discountPercent > 0 && (
                                        <div className="flex-center mb-24 flex-wrap gap-16 bg-color-one rounded-8 py-16 px-24 position-relative z-1">
                                            <img
                                                src="/assets/images/bg/details-offer-bg.png"
                                                alt=""
                                                className="position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 z-n1"
                                            />
                                            <div className="flex-align gap-16">
                                                <span className="text-white text-sm">Special Offer:</span>
                                            </div>
                                            <div className="countdown" id="countdown11">
                                                <ul className="countdown-list flex-align flex-wrap">
                                                    <li className="countdown-list__item text-heading flex-align gap-4 text-xs fw-medium w-28 h-28 rounded-4 border border-main-600 p-0 flex-center">
                                                        {timeLeft.days}<span className="days" />
                                                    </li>
                                                    <li className="countdown-list__item text-heading flex-align gap-4 text-xs fw-medium w-28 h-28 rounded-4 border border-main-600 p-0 flex-center">
                                                        {timeLeft.hours}<span className="hours" />
                                                    </li>
                                                    <li className="countdown-list__item text-heading flex-align gap-4 text-xs fw-medium w-28 h-28 rounded-4 border border-main-600 p-0 flex-center">
                                                        {timeLeft.minutes}<span className="minutes" />
                                                    </li>
                                                    <li className="countdown-list__item text-heading flex-align gap-4 text-xs fw-medium w-28 h-28 rounded-4 border border-main-600 p-0 flex-center">
                                                        {timeLeft.seconds}<span className="seconds" />
                                                    </li>
                                                </ul>
                                            </div>
                                            <span className="text-white text-xs">
                                                Remains until the end of the offer
                                            </span>
                                        </div>
                                    )}

                                    {/* Product Name */}
                                    <h5 className="mb-12">{product.product_name}</h5>

                                    {/* Rating */}
                                    <div className="flex-align flex-wrap gap-12">
                                        <div className="flex-align gap-12 flex-wrap">
                                            <div className="flex-align gap-8">
                                                {[...Array(5)].map((_, index) => (
                                                    <span
                                                        key={index}
                                                        className={`text-15 fw-medium d-flex ${index < Math.round(product.average_rating || 0)
                                                                ? 'text-warning-600'
                                                                : 'text-gray-400'
                                                            }`}
                                                    >
                                                        <i className="ph-fill ph-star" />
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="text-sm fw-medium text-neutral-600">
                                                {product.average_rating || 0} Star Rating
                                            </span>
                                            <span className="text-sm fw-medium text-gray-500">
                                                ({product.review_count || 0})
                                            </span>
                                        </div>
                                        <span className="text-sm fw-medium text-gray-500">|</span>
                                        <span className="text-gray-900">
                                            <span className="text-gray-400">SKU:</span>{product.product_id}
                                        </span>
                                    </div>

                                    <span className="mt-32 pt-32 text-gray-700 border-top border-gray-100 d-block" />

                                    {/* Description */}
                                    <p className="text-gray-700">{product.description}</p>

                                    {/* Price */}
                                    <div className="my-32 flex-align gap-16 flex-wrap">
                                        {discountPercent > 0 && (
                                            <div className="flex-align gap-8">
                                                <div className="flex-align gap-8 text-main-two-600">
                                                    <i className="ph-fill ph-seal-percent text-xl" />
                                                    -{discountPercent}%
                                                </div>
                                            </div>
                                        )}
                                        <h6 className="mb-0">USD {product.price ? Number(product.price).toFixed(2) : undefined}</h6>
                                        {product.original_price && product.original_price > product.price && (
                                            <div className="flex-align gap-8">
                                                <span className="text-gray-700">Regular Price</span>
                                                <h6 className="text-xl text-gray-400 mb-0 fw-medium">
                                                    USD {product.original_price.toFixed(2)}
                                                </h6>
                                            </div>
                                        )}
                                    </div>

                                    {/* Category & Store */}
                                    <span className="mt-32 pt-32 text-gray-700 border-top border-gray-100 d-block" />
                                    <div className="mt-32">
                                        {product.category && (
                                            <div className="mb-16">
                                                <span className="text-gray-700">Category: </span>
                                                <Link
                                                    to={`/shop?category=${product.category.category_id}`}
                                                    className="text-main-600 hover-text-main-800"
                                                >
                                                    {product.category.category_name}
                                                </Link>
                                            </div>
                                        )}
                                        {product.store && (
                                            <div className="mb-16">
                                                <span className="text-gray-700">Store: </span>
                                                <Link
                                                    to={`/store/${product.store.store_id}`}
                                                    className="text-main-600 hover-text-main-800 fw-medium"
                                                >
                                                    {product.store.store_name}
                                                </Link>
                                            </div>
                                        )}
                                        <div className="mb-16">
                                            <span className="text-gray-700">Stock: </span>
                                            <span className={product.stock_quantity > 0 ? 'text-success-600 fw-medium' : 'text-danger-600 fw-medium'}>
                                                {product.stock_quantity > 0
                                                    ? `${product.stock_quantity} available`
                                                    : 'Out of Stock'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-xl-3">
                        <div className="product-details__sidebar py-40 px-32 border border-gray-100 rounded-16">
                            {/* Quantity */}
                            <div className="mb-32">
                                <label
                                    htmlFor="stock"
                                    className="text-lg mb-8 text-heading fw-semibold d-block"
                                >
                                    Quantity
                                </label>
                                <div className="d-flex rounded-4 overflow-hidden">
                                    <button
                                        onClick={decrementQuantity}
                                        type="button"
                                        className="quantity__minus flex-shrink-0 h-48 w-48 text-neutral-600 bg-gray-50 flex-center hover-bg-main-600 hover-text-white"
                                        disabled={quantity <= 1}
                                    >
                                        <i className="ph ph-minus" />
                                    </button>
                                    <input
                                        type="number"
                                        className="quantity__input flex-grow-1 border border-gray-100 border-start-0 border-end-0 text-center w-32 px-16"
                                        id="stock"
                                        value={quantity}
                                        readOnly
                                    />
                                    <button
                                        onClick={incrementQuantity}
                                        type="button"
                                        className="quantity__plus flex-shrink-0 h-48 w-48 text-neutral-600 bg-gray-50 flex-center hover-bg-main-600 hover-text-white"
                                        disabled={quantity >= product.stock_quantity}
                                    >
                                        <i className="ph ph-plus" />
                                    </button>
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="mb-32">
                                <div className="flex-between flex-wrap gap-8 border-bottom border-gray-100 pb-16 mb-16">
                                    <span className="text-gray-500">Price</span>
                                    <h6 className="text-lg mb-0">${product.price ? Number(product.price).toFixed(2) : undefined}</h6>
                                </div>
                                <div className="flex-between flex-wrap gap-8">
                                    <span className="text-gray-500">Subtotal</span>
                                    <h6 className="text-lg mb-0">${(product.price * quantity).toFixed(2)}</h6>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <button
                                onClick={handleAddToCart}
                                className="btn btn-main flex-center gap-8 rounded-8 py-16 fw-normal mt-48 w-100"
                                disabled={addingToCart || product.stock_quantity === 0}
                            >
                                {addingToCart ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <i className="ph ph-shopping-cart-simple text-lg" />
                                        Add To Cart
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="btn btn-outline-main rounded-8 py-16 fw-normal mt-16 w-100"
                                disabled={addingToCart || product.stock_quantity === 0}
                            >
                                Buy Now
                            </button>

                            {/* Store Info */}
                            {product.store && (
                                <div className="mt-32">
                                    <div className="px-16 py-8 bg-main-50 rounded-8 flex-between gap-24 mb-0">
                                        <span className="w-32 h-32 bg-white text-main-600 rounded-circle flex-center text-xl flex-shrink-0">
                                            <i className="ph-fill ph-storefront" />
                                        </span>
                                        <span className="text-sm text-neutral-600">
                                            Sold by:{" "}
                                            <span className="fw-semibold">{product.store.store_name}</span>
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Share */}
                            <div className="mt-32">
                                <div className="px-32 py-16 rounded-8 border border-gray-100 flex-between gap-8">
                                    <Link to="#" className="d-flex text-main-600 text-28">
                                        <i className="ph-fill ph-heart" />
                                    </Link>
                                    <span className="h-26 border border-gray-100" />
                                    <div className="dropdown on-hover-item">
                                        <button className="d-flex text-main-600 text-28" type="button">
                                            <i className="ph-fill ph-share-network" />
                                        </button>
                                        <div className="on-hover-dropdown common-dropdown border-0 inset-inline-start-auto inset-inline-end-0">
                                            <ul className="flex-align gap-16">
                                                <li>
                                                    <Link
                                                        to="https://www.facebook.com"
                                                        className="w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white"
                                                    >
                                                        <i className="ph-fill ph-facebook-logo" />
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        to="https://www.twitter.com"
                                                        className="w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white"
                                                    >
                                                        <i className="ph-fill ph-twitter-logo" />
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description & Reviews Tabs */}
                <div className="pt-80">
                    <div className="product-dContent border rounded-24">
                        <div className="product-dContent__header border-bottom border-gray-100 flex-between flex-wrap gap-16">
                            <ul
                                className="nav common-tab nav-pills mb-3"
                                id="pills-tab"
                                role="tablist"
                            >
                                <li className="nav-item" role="presentation">
                                    <button
                                        className="nav-link active"
                                        id="pills-description-tab"
                                        data-bs-toggle="pill"
                                        data-bs-target="#pills-description"
                                        type="button"
                                        role="tab"
                                        aria-controls="pills-description"
                                        aria-selected="true"
                                    >
                                        Description
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className="nav-link"
                                        id="pills-reviews-tab"
                                        data-bs-toggle="pill"
                                        data-bs-target="#pills-reviews"
                                        type="button"
                                        role="tab"
                                        aria-controls="pills-reviews"
                                        aria-selected="false"
                                    >
                                        Reviews ({reviews.length})
                                    </button>
                                </li>
                            </ul>
                            <Link
                                to="#"
                                className="btn bg-color-one rounded-16 flex-align gap-8 text-main-600 hover-bg-main-600 hover-text-white"
                            >
                                <img src="/assets/images/icon/satisfaction-icon.png" alt="" />
                                100% Satisfaction Guaranteed
                            </Link>
                        </div>
                        <div className="product-dContent__box">
                            <div className="tab-content" id="pills-tabContent">
                                {/* Description Tab */}
                                <div
                                    className="tab-pane fade show active"
                                    id="pills-description"
                                    role="tabpanel"
                                    aria-labelledby="pills-description-tab"
                                    tabIndex={0}
                                >
                                    <div className="mb-40">
                                        <h6 className="mb-24">Product Description</h6>
                                        <p>{product.description}</p>
                                    </div>

                                    {/* Product Specifications */}
                                    {product.specifications && product.specifications.length > 0 && (
                                        <div className="mb-40">
                                            <h6 className="mb-24">Product Specifications</h6>
                                            <ul className="mt-32">
                                                {product.specifications.map((spec, index) => (
                                                    <li key={index} className="text-gray-400 mb-14 flex-align gap-14">
                                                        <span className="w-20 h-20 bg-main-50 text-main-600 text-xs flex-center rounded-circle">
                                                            <i className="ph ph-check" />
                                                        </span>
                                                        <span className="text-heading fw-medium">
                                                            {spec.label}:
                                                            <span className="text-gray-500"> {spec.value}</span>
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Reviews Tab */}
                                <div
                                    className="tab-pane fade"
                                    id="pills-reviews"
                                    role="tabpanel"
                                    aria-labelledby="pills-reviews-tab"
                                    tabIndex={0}
                                >
                                    <div className="row g-4">
                                        {/* Reviews List */}
                                        <div className="col-lg-6">
                                            <h6 className="mb-24">Customer Reviews</h6>

                                            {loadingReviews ? (
                                                <div className="text-center py-4">
                                                    <div className="spinner-border text-main-600" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </div>
                                            ) : reviews.length === 0 ? (
                                                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                                            ) : (
                                                reviews.map((review, index) => (
                                                    <div
                                                        key={review.review_id}
                                                        className={`d-flex align-items-start gap-24 ${index < reviews.length - 1 ? 'pb-44 border-bottom border-gray-100 mb-44' : ''
                                                            }`}
                                                    >
                                                        <img
                                                            src={review.user?.avatar_url || "/assets/images/thumbs/comment-img1.png"}
                                                            alt={review.user?.full_name}
                                                            className="w-52 h-52 object-fit-cover rounded-circle flex-shrink-0"
                                                        />
                                                        <div className="flex-grow-1">
                                                            <div className="flex-between align-items-start gap-8">
                                                                <div>
                                                                    <h6 className="mb-12 text-md">{review.user?.full_name || 'Anonymous'}</h6>
                                                                    <div className="flex-align gap-8">
                                                                        {[...Array(5)].map((_, starIndex) => (
                                                                            <span
                                                                                key={starIndex}
                                                                                className={`text-15 fw-medium d-flex ${starIndex < review.rating
                                                                                        ? 'text-warning-600'
                                                                                        : 'text-gray-400'
                                                                                    }`}
                                                                            >
                                                                                <i className="ph-fill ph-star" />
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <span className="text-gray-800 text-xs">
                                                                    {new Date(review.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <h6 className="mb-14 text-md mt-24">{review.title}</h6>
                                                            <p className="text-gray-700">{review.content}</p>
                                                            <div className="flex-align gap-20 mt-44">
                                                                <button
                                                                    className="flex-align gap-12 text-gray-700 hover-text-main-600"
                                                                    onClick={() => handleLikeReview(review.review_id)}
                                                                >
                                                                    <i className="ph-bold ph-thumbs-up" />
                                                                    Like {review.likes > 0 && `(${review.likes})`}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            {/* Write Review Form */}
                                            <div className="mt-56" id="comment-form">
                                                <div>
                                                    <h6 className="mb-24">Write a Review</h6>
                                                    <span className="text-heading mb-8 d-block">
                                                        What is it like to Product?
                                                    </span>
                                                    <div className="flex-align gap-8 mb-16">
                                                        {[...Array(5)].map((_, index) => (
                                                            <span
                                                                key={index}
                                                                className={`text-15 fw-medium d-flex cursor-pointer ${index < reviewRating
                                                                        ? 'text-warning-600'
                                                                        : 'text-gray-400'
                                                                    }`}
                                                                onClick={() => setReviewRating(index + 1)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <i className="ph-fill ph-star" />
                                                            </span>
                                                        ))}
                                                        <span className="text-sm text-gray-600 ms-2">
                                                            ({reviewRating} stars)
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-32">
                                                    <form onSubmit={handleSubmitReview}>
                                                        <div className="mb-32">
                                                            <label
                                                                htmlFor="review-title"
                                                                className="text-neutral-600 mb-8"
                                                            >
                                                                Review Title <span className="text-danger">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="common-input rounded-8"
                                                                id="review-title"
                                                                placeholder="Great Product"
                                                                value={reviewForm.title}
                                                                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="mb-32">
                                                            <label
                                                                htmlFor="review-content"
                                                                className="text-neutral-600 mb-8"
                                                            >
                                                                Review Content <span className="text-danger">*</span>
                                                            </label>
                                                            <textarea
                                                                className="common-input rounded-8"
                                                                id="review-content"
                                                                rows="5"
                                                                placeholder="Share your experience with this product..."
                                                                value={reviewForm.content}
                                                                onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            className="btn btn-main rounded-pill mt-48"
                                                            disabled={submittingReview}
                                                        >
                                                            {submittingReview ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                                    Submitting...
                                                                </>
                                                            ) : (
                                                                'Submit Review'
                                                            )}
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rating Statistics */}
                                        <div className="col-lg-6">
                                            <div className="ms-xxl-5">
                                                <h6 className="mb-24">Customer Feedback</h6>
                                                <div className="d-flex flex-wrap gap-44">
                                                    <div className="border border-gray-100 rounded-8 px-40 py-52 flex-center flex-column flex-shrink-0 text-center">
                                                        <h2 className="mb-6 text-main-600">
                                                            {product.average_rating?.toFixed(1) || '0.0'}
                                                        </h2>
                                                        <div className="flex-center gap-8">
                                                            {[...Array(5)].map((_, index) => (
                                                                <span
                                                                    key={index}
                                                                    className={`text-15 fw-medium d-flex ${index < Math.round(product.average_rating || 0)
                                                                            ? 'text-warning-600'
                                                                            : 'text-gray-400'
                                                                        }`}
                                                                >
                                                                    <i className="ph-fill ph-star" />
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="mt-16 text-gray-500">
                                                            Average Product Rating
                                                        </span>
                                                    </div>
                                                    <div className="border border-gray-100 rounded-8 px-24 py-40 flex-grow-1">
                                                        {ratingDistribution.map((dist, index) => (
                                                            <div key={dist.stars} className={`flex-align gap-8 ${index < 4 ? 'mb-20' : 'mb-0'}`}>
                                                                <span className="text-gray-900 flex-shrink-0">{dist.stars}</span>
                                                                <div
                                                                    className="progress w-100 bg-gray-100 rounded-pill h-8"
                                                                    role="progressbar"
                                                                    aria-label="Rating distribution"
                                                                    aria-valuenow={dist.percentage}
                                                                    aria-valuemin={0}
                                                                    aria-valuemax={100}
                                                                >
                                                                    <div
                                                                        className="progress-bar bg-main-600 rounded-pill"
                                                                        style={{ width: `${dist.percentage}%` }}
                                                                    />
                                                                </div>
                                                                <div className="flex-align gap-4">
                                                                    {[...Array(5)].map((_, starIndex) => (
                                                                        <span
                                                                            key={starIndex}
                                                                            className={`text-xs fw-medium d-flex ${starIndex < dist.stars
                                                                                    ? 'text-warning-600'
                                                                                    : 'text-gray-400'
                                                                                }`}
                                                                        >
                                                                            <i className="ph-fill ph-star" />
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <span className="text-gray-900 flex-shrink-0">
                                                                    {dist.count}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProductDetailsTwo