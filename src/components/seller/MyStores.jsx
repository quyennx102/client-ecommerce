import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import storeService from '../../services/storeService';

const MyStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyStores();
  }, []);

  const fetchMyStores = async () => {
    try {
      const response = await storeService.getMyStores();
      if (response.success) {
        setStores(response.data);
      }
    } catch (error) {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge bg-warning',
      'active': 'badge bg-success',
      'suspended': 'badge bg-danger'
    };
    return badges[status] || 'badge bg-secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-80">
        <div className="spinner-border text-main-600"></div>
      </div>
    );
  }

  return (
    <section className="py-80">
      <div className="container container-lg">
        <div className="mb-32 flex-between flex-wrap gap-16">
          <h4 className="mb-0">My Stores</h4>
          <Link to="/seller/stores/create" className="btn btn-main py-18 px-40">
            <i className="ph ph-plus me-8"></i>
            Create New Store
          </Link>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-80">
            <i className="ph ph-storefront text-gray-300" style={{ fontSize: '80px' }}></i>
            <h5 className="mt-24 mb-16">No stores yet</h5>
            <p className="text-gray-500 mb-32">Create your first store to start selling</p>
            <Link to="/seller/stores/create" className="btn btn-main px-40">
              Create Store
            </Link>
          </div>
        ) : (
          <div className="row gy-4">
            {stores.map(store => (
              <div key={store.store_id} className="col-lg-6">
                <div className="border border-gray-100 rounded-16 p-24 hover-border-main-600 transition-1">
                  <div className="flex-between mb-16">
                    <h6 className="mb-0">{store.store_name}</h6>
                    <span className={getStatusBadge(store.status)}>
                      {store.status}
                    </span>
                  </div>

                  {store.banner_url && (
                    <div className="mb-16">
                      <img
                        src={`${process.env.REACT_APP_IMAGE_URL}${store.banner_url}`}
                        alt={store.store_name}
                        className="w-100 rounded-8"
                        style={{ height: '150px', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <p className="text-gray-500 mb-16 text-line-2">
                    {store.description || 'No description'}
                  </p>

                  <div className="flex-align gap-32 mb-24">
                    <div>
                      <span className="text-gray-500 text-sm">Products</span>
                      <h6 className="mb-0">{store.products_count || 0}</h6>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Pending Orders</span>
                      <h6 className="mb-0">{store.pending_orders_count || 0}</h6>
                    </div>
                  </div>

                  <div className="flex-align gap-8">
                    <Link
                      to={`/seller/stores/${store.store_id}/products`}
                      className="btn btn-main py-12 px-24 flex-grow-1"
                    >
                      Manage Products
                    </Link>
                    <Link
                      to={`/seller/stores/${store.store_id}/discounts`}
                      className="btn btn-outline-main py-12 px-24"
                      title="Manage Discounts"
                    >
                      <i className="ph ph-ticket"></i>
                    </Link>
                    <Link
                      to={`/seller/stores/${store.store_id}/stats`}
                      className="btn btn-outline-main py-12 px-24"
                    >
                      <i className="ph ph-chart-line"></i>
                    </Link>
                    <Link
                      to={`/seller/stores/${store.store_id}/edit`}
                      className="btn btn-outline-main py-12 px-24"
                    >
                      <i className="ph ph-pencil"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyStores;