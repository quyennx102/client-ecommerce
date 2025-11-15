import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import storeService from '../../services/storeService';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: '',
    sort_by: 'created_at',
    order: 'DESC'
  });

  // Modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [modalAction, setModalAction] = useState(''); // 'active' or 'suspended'
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [filters]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await storeService.getAllStoresForAdmin(filters);
      if (response.success) {
        setStores(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  };

  const openApproveModal = (store, action) => {
    setSelectedStore(store);
    setModalAction(action);
    setReason('');
    setShowApproveModal(true);
  };

  const closeApproveModal = () => {
    setShowApproveModal(false);
    setSelectedStore(null);
    setModalAction('');
    setReason('');
  };

  const handleApproveStore = async () => {
    if (!selectedStore) return;

    if (modalAction === 'suspended' && !reason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }

    setProcessing(true);
    try {
      const response = await storeService.approveStore(
        selectedStore.store_id,
        modalAction,
        reason.trim() || null
      );
      
      if (response.success) {
        toast.success(response.message);
        fetchStores();
        closeApproveModal();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update store status');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { class: 'bg-warning', text: 'Pending' },
      'active': { class: 'bg-success', text: 'Active' },
      'suspended': { class: 'bg-danger', text: 'Suspended' }
    };
    const badge = badges[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      search: '',
      status: '',
      sort_by: 'created_at',
      order: 'DESC'
    });
  };

  if (loading && filters.page === 1) {
    return (
      <div className="text-center py-80">
        <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-16 text-gray-500">Loading stores...</p>
      </div>
    );
  }

  return (
    <section className="py-80">
      <div className="container container-lg">
        {/* Header */}
        <div className="mb-32">
          <h4 className="mb-16">Store Management</h4>
          <p className="text-gray-500">Manage and approve seller stores</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-16 p-24 mb-32 shadow-sm">
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-4">
              <label className="form-label text-sm">Search</label>
              <input
                type="text"
                className="form-control common-input"
                placeholder="Search stores..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="col-md-3">
              <label className="form-label text-sm">Status</label>
              <select
                className="form-control common-input"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="col-md-3">
              <label className="form-label text-sm">Sort By</label>
              <select
                className="form-control common-input"
                value={`${filters.sort_by}_${filters.order}`}
                onChange={(e) => {
                  const [sort_by, order] = e.target.value.split('_');
                  setFilters(prev => ({ ...prev, sort_by, order }));
                }}
              >
                <option value="created_at_DESC">Newest First</option>
                <option value="created_at_ASC">Oldest First</option>
                <option value="store_name_ASC">Name: A to Z</option>
                <option value="store_name_DESC">Name: Z to A</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-main w-100"
                onClick={resetFilters}
              >
                <i className="ph ph-arrow-counter-clockwise me-8"></i>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Stores List */}
        {stores.length === 0 ? (
          <div className="text-center py-80">
            <i className="ph ph-storefront text-gray-300" style={{ fontSize: '80px' }}></i>
            <h5 className="mt-24 mb-16">No stores found</h5>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="row gy-4">
              {stores.map(store => (
                <div key={store.store_id} className="col-12">
                  <div className="border border-gray-100 rounded-16 p-24 hover-border-main-600 transition-1">
                    <div className="row align-items-center">
                      {/* Store Info */}
                      <div className="col-lg-6">
                        <div className="d-flex gap-16">
                          {/* Logo */}
                          <div className="flex-shrink-0">
                            {store.logo_url ? (
                              <img
                                src={`${process.env.REACT_APP_IMAGE_URL}${store.logo_url}`}
                                alt={store.store_name}
                                className="rounded-circle"
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="bg-gray-100 rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '60px', height: '60px' }}>
                                <i className="ph ph-storefront text-gray-400" style={{ fontSize: '24px' }}></i>
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-8 mb-8">
                              <h6 className="mb-0">{store.store_name}</h6>
                              {getStatusBadge(store.status)}
                            </div>
                            <p className="text-gray-500 text-sm mb-8 text-line-2">
                              {store.description || 'No description'}
                            </p>
                            <div className="d-flex align-items-center gap-8 text-sm text-gray-600">
                              <i className="ph ph-user"></i>
                              <span>{store.seller?.full_name}</span>
                              <span className="mx-8">•</span>
                              <span>{store.seller?.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="col-lg-3 mt-16 mt-lg-0">
                        <div className="d-flex gap-24">
                          <div>
                            <span className="text-gray-500 text-sm d-block">Products</span>
                            <h6 className="mb-0">{store.products_count || 0}</h6>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm d-block">Created</span>
                            <span className="text-sm">{new Date(store.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-lg-3 mt-16 mt-lg-0">
                        <div className="d-flex gap-8 justify-content-lg-end">
                          {/* View Store */}
                          <Link
                            to={`/stores/${store.store_id}/products`}
                            className="btn btn-outline-main py-8 px-16"
                            title="View Store"
                          >
                            <i className="ph ph-eye"></i>
                          </Link>

                          {/* Approve Button */}
                          {store.status === 'pending' && (
                            <button
                              className="btn btn-outline-main btn-success-600 py-8 px-16"
                              onClick={() => openApproveModal(store, 'active')}
                              title="Approve Store"
                            >
                              <i className="ph ph-check-circle me-4"></i>
                              Approve
                            </button>
                          )}

                          {/* Suspend Button */}
                          {store.status === 'active' && (
                            <button
                              className="btn btn-outline-main btn-danger-600 py-8 px-16"
                              onClick={() => openApproveModal(store, 'suspended')}
                              title="Suspend Store"
                            >
                              <i className="ph ph-x-circle me-4"></i>
                              Suspend
                            </button>
                          )}

                          {/* Activate Button */}
                          {store.status === 'suspended' && (
                            <button
                              className="btn btn-success-600 py-8 px-16"
                              onClick={() => openApproveModal(store, 'active')}
                              title="Activate Store"
                            >
                              <i className="ph ph-check-circle me-4"></i>
                              Activate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex-center mt-48">
                <ul className="pagination flex-center flex-wrap gap-16">
                  <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                      className="page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium text-neutral-600 border border-gray-100"
                      disabled={pagination.currentPage === 1}
                    >
                      <i className="ph-bold ph-arrow-left" />
                    </button>
                  </li>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                    ) {
                      return (
                        <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                          <button
                            onClick={() => handleFilterChange('page', page)}
                            className={`page-link h-64 w-64 flex-center text-md rounded-8 fw-medium border border-gray-100 ${
                              pagination.currentPage === page ? 'bg-main-600 text-white border-main-600' : 'text-neutral-600'
                            }`}
                          >
                            {page}
                          </button>
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
                    <button
                      onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                      className="page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium text-neutral-600 border border-gray-100"
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      <i className="ph-bold ph-arrow-right" />
                    </button>
                  </li>
                </ul>
                <div className="ms-32 text-sm text-gray-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Approve/Suspend Modal */}
      {showApproveModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalAction === 'active' ? 'Approve Store' : 'Suspend Store'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeApproveModal}
                  disabled={processing}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-16">
                  Are you sure you want to {modalAction === 'active' ? 'approve' : 'suspend'} the store{' '}
                  <strong>{selectedStore?.store_name}</strong>?
                </p>
                
                {modalAction === 'suspended' && (
                  <div className="mb-0">
                    <label className="form-label">Reason for suspension *</label>
                    <textarea
                      className="form-control common-input"
                      rows="3"
                      placeholder="Enter reason for suspension..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={processing}
                    ></textarea>
                  </div>
                )}

                {modalAction === 'active' && selectedStore?.status === 'pending' && (
                  <div className="alert alert-info mb-0">
                    <i className="ph ph-info me-8"></i>
                    The seller will be notified that their store has been approved.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-main"
                  onClick={closeApproveModal}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-main ${modalAction === 'active' ? 'btn-success-600' : 'btn-danger-600'}`}
                  onClick={handleApproveStore}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-8"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className={`ph ${modalAction === 'active' ? 'ph-check-circle' : 'ph-x-circle'} me-8`}></i>
                      {modalAction === 'active' ? 'Approve' : 'Suspend'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminStores;