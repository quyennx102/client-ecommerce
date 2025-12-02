import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import followService from '../services/followService';

const MyFollowedStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [unfollowingStores, setUnfollowingStores] = useState(new Set());

  useEffect(() => {
    fetchFollowedStores();
  }, [currentPage]);

  const fetchFollowedStores = async () => {
    setLoading(true);
    try {
      const response = await followService.getMyFollowedStores({ 
        page: currentPage, 
        limit: 12 
      });
      
      if (response.success) {
        setStores(response.data.stores);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load followed stores:', error);
      toast.error('Failed to load followed stores');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (storeId) => {
    if (unfollowingStores.has(storeId)) return;
    
    setUnfollowingStores(prev => new Set(prev).add(storeId));
    
    try {
      const response = await followService.unfollowStore(storeId);
      
      if (response.success) {
        toast.success('Store unfollowed successfully');
        // Remove store from list
        setStores(prev => prev.filter(store => store.followed_id !== storeId));
      }
    } catch (error) {
      console.error('Failed to unfollow store:', error);
      toast.error(error.response?.data?.message || 'Failed to unfollow store');
    } finally {
      setUnfollowingStores(prev => {
        const newSet = new Set(prev);
        newSet.delete(storeId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <section className="py-80">
        <div className="container">
          <div className="text-center py-80">
            <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-16 text-gray-500">Loading followed stores...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-80">
      <div className="container">
        <div className="mb-40">
          <h4 className="mb-16">My Followed Stores</h4>
          <p className="text-gray-600">
            Stores you're following ({pagination?.totalItems || 0})
          </p>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-80">
            <i className="ph ph-heart text-gray-300" style={{ fontSize: '80px' }}></i>
            <h5 className="mt-24 mb-16">No Followed Stores</h5>
            <p className="text-gray-500 mb-32">
              You haven't followed any stores yet. Start following to get updates!
            </p>
            <Link to="/products" className="btn btn-main px-40">
              Browse Stores
            </Link>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {stores.map((follow) => {
                const store = follow.followedStore;
                if (!store) return null;
                
                return (
                  <div key={follow.follow_id} className="col-lg-3 col-md-4 col-sm-6">
                    <div className="border border-gray-100 rounded-16 p-24 hover-border-main-600 transition-2">
                      <Link 
                        to={`/stores/${store.store_id}/products`}
                        className="d-flex flex-column align-items-center text-center"
                      >
                        {store.logo_url ? (
                          <img
                            src={`${process.env.REACT_APP_IMAGE_URL}${store.logo_url}`}
                            alt={store.store_name}
                            className="rounded-circle mb-16"
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div 
                            className="bg-main-50 rounded-circle d-flex align-items-center justify-content-center mb-16"
                            style={{ width: '80px', height: '80px' }}
                          >
                            <i className="ph ph-storefront text-main-600" style={{ fontSize: '40px' }}></i>
                          </div>
                        )}
                        
                        <h6 className="mb-8 text-line-2">{store.store_name}</h6>
                        
                        {store.description && (
                          <p className="text-sm text-gray-600 text-line-2 mb-12">
                            {store.description}
                          </p>
                        )}
                        
                        <div className="d-flex align-items-center gap-8 mb-16">
                          <i className="ph ph-users text-gray-500"></i>
                          <span className="text-sm text-gray-600">
                            {follow.followers_count} Followers
                          </span>
                        </div>
                      </Link>
                      
                      <button
                        className="btn btn-outline-main w-100 py-8"
                        onClick={() => handleUnfollow(store.store_id)}
                        disabled={unfollowingStores.has(store.store_id)}
                      >
                        {unfollowingStores.has(store.store_id) ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Unfollowing...
                          </>
                        ) : (
                          <>
                            <i className="ph ph-check me-2"></i>
                            Following
                          </>
                        )}
                      </button>
                      
                      <div className="text-center mt-12">
                        <span className="text-xs text-gray-500">
                          Followed on {new Date(follow.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex-center mt-48">
                <ul className="pagination flex-center flex-wrap gap-16">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium text-neutral-600 border border-gray-100"
                      disabled={currentPage === 1}
                    >
                      <i className="ph-bold ph-arrow-left" />
                    </button>
                  </li>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <li
                          key={page}
                          className={`page-item ${currentPage === page ? 'active' : ''}`}
                        >
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`page-link h-64 w-64 flex-center text-md rounded-8 fw-medium border border-gray-100 ${
                              currentPage === page
                                ? 'bg-main-600 text-white border-main-600'
                                : 'text-neutral-600'
                            }`}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <li key={page} className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                    }
                    return null;
                  })}
                  
                  <li className={`page-item ${currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      className="page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium text-neutral-600 border border-gray-100"
                      disabled={currentPage === pagination.totalPages}
                    >
                      <i className="ph-bold ph-arrow-right" />
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default MyFollowedStores;