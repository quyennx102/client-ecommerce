import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import storeService from '../../services/storeService';

const TopStores = ({ type = 'sales', limit = 10, showTitle = true }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopStores();
  }, [type, limit]);

  const fetchTopStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeService.getTopStores(type, limit);
      setStores(response.data.stores || []);
    } catch (err) {
      console.error('Error fetching top stores:', err);
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  // Slider settings
  function SampleNextArrow(props) {
    const { className, onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} slick-next slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-two-600 text-xl hover-bg-main-two-600 hover-text-white transition-1`}
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
        className={`${className} slick-prev slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-two-600 text-xl hover-bg-main-two-600 hover-text-white transition-1`}
      >
        <i className="ph ph-caret-left" />
      </button>
    );
  }

  const settings = {
    dots: false,
    arrows: true,
    infinite: stores.length > 8,
    speed: 1000,
    slidesToShow: Math.min(8, stores.length),
    slidesToScroll: 1,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1599,
        settings: { slidesToShow: Math.min(7, stores.length) }
      },
      {
        breakpoint: 1399,
        settings: { slidesToShow: Math.min(6, stores.length) }
      },
      {
        breakpoint: 992,
        settings: { slidesToShow: Math.min(5, stores.length) }
      },
      {
        breakpoint: 575,
        settings: { slidesToShow: Math.min(4, stores.length) }
      },
      {
        breakpoint: 424,
        settings: { slidesToShow: Math.min(3, stores.length) }
      },
      {
        breakpoint: 359,
        settings: { slidesToShow: Math.min(2, stores.length) }
      }
    ]
  };

  const getTitleByType = () => {
    const titles = {
      sales: 'Top Selling Stores',
      rating: 'Highest Rated Stores',
      followers: 'Most Followed Stores',
      revenue: 'Top Revenue Stores',
      reviews: 'Most Reviewed Stores',
      products: 'Stores with Most Products'
    };
    return titles[type] || 'Top Stores';
  };

  const getStatLabel = (store) => {
    switch(type) {
      case 'sales':
        return `${store.total_sold || 0} sold`;
      case 'rating':
        return `⭐ ${parseFloat(store.average_rating || 0).toFixed(1)} (${store.total_reviews || 0})`;
      case 'followers':
        return `${store.followers_count || 0} followers`;
      case 'revenue':
        return `$${parseFloat(store.period_revenue || 0).toLocaleString()}`;
      case 'reviews':
        return `${store.total_reviews || 0} reviews`;
      case 'products':
        return `${store.products_count || 0} products`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="top-brand py-80">
        <div className="container container-lg">
          <div className="border border-gray-100 p-24 rounded-16">
            <div className="text-center py-40">
              <div className="spinner-border text-main-600" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-gray-600">Loading stores...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="top-brand py-80">
        <div className="container container-lg">
          <div className="border border-danger p-24 rounded-16">
            <div className="text-center py-40">
              <i className="ph ph-warning-circle text-danger" style={{ fontSize: '48px' }}></i>
              <p className="mt-3 text-danger">{error}</p>
              <button 
                onClick={fetchTopStores}
                className="btn btn-main mt-3"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="top-brand py-80">
        <div className="container container-lg">
          <div className="border border-gray-100 p-24 rounded-16">
            <div className="text-center py-40">
              <i className="ph ph-storefront text-gray-400" style={{ fontSize: '48px' }}></i>
              <p className="mt-3 text-gray-600">No stores found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="top-brand py-80">
      <div className="container container-lg">
        <div className="border border-gray-100 p-24 rounded-16">
          {showTitle && (
            <div className="section-heading mb-24">
              <div className="flex-between flex-wrap gap-8">
                <h5 className="mb-0">{getTitleByType()}</h5>
                <Link 
                  to="/stores" 
                  className="text-sm fw-medium text-gray-700 hover-text-main-600 hover-text-decoration-underline"
                >
                  View All Stores
                </Link>
              </div>
            </div>
          )}
          
          <div className="top-brand__slider">
            <Slider {...settings}>
              {stores.map((store, index) => (
                <div key={store.store_id}>
                  <Link 
                    to={`/stores/${store.store_id}/products`}
                    className="top-brand__item flex-center flex-column rounded-8 border border-gray-100 hover-border-main-600 transition-1 p-16 position-relative"
                    style={{ textDecoration: 'none', minHeight: '150px' }}
                  >
                    {/* Rank Badge */}
                    {index < 3 && (
                      <span className="position-absolute top-0 start-0 mt-2 ms-2">
                        <span className={`badge ${
                          index === 0 ? 'bg-warning' : 
                          index === 1 ? 'bg-secondary' : 
                          'bg-danger-subtle text-danger'
                        }`}>
                          #{index + 1}
                        </span>
                      </span>
                    )}

                    {/* Store Logo */}
                    <div className="mb-5" style={{ width: '80px', height: '80px' }}>
                      {store.logo_url ? (
                        <img 
                          src={`${process.env.REACT_APP_IMAGE_URL}${store.logo_url}`}
                          alt={store.store_name}
                          className="w-100 h-100 object-fit-cover rounded-circle border border-gray-100"
                        />
                      ) : (
                        <div className="w-100 h-100 bg-main-50 rounded-circle flex-center">
                          <i className="ph ph-storefront text-main-600 text-2xl"></i>
                        </div>
                      )}
                    </div>

                    {/* Store Name */}
                    <h6 className="text-sm text-center mb-8 text-line-clamp-1 fw-semibold text-gray-900">
                      {store.store_name}
                    </h6>

                    {/* Store Stats */}
                    <p className="text-xs text-gray-600 mb-0 text-center">
                      {getStatLabel(store)}
                    </p>

                    {/* Products Count */}
                    <p className="text-xs text-gray-500 mt-4">
                      {store.products_count || 0} products
                    </p>
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopStores;