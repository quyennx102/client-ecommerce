import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    role: '',
    status: '',
    search: ''
  });

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    role: '',
    status: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers(filters);
      if (response.success) {
        setUsers(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      role: '',
      status: '',
      search: ''
    });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role,
      status: user.status
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const saveUserChanges = async () => {
    try {
      // Update role if changed
      if (editForm.role !== selectedUser.role) {
        await adminService.updateUserRole(selectedUser.user_id, editForm.role);
      }

      // Update status if changed
      if (editForm.status !== selectedUser.status) {
        await adminService.updateUserStatus(selectedUser.user_id, editForm.status);
      }

      toast.success('User updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const confirmDeleteUser = async () => {
    try {
      await adminService.deleteUser(selectedUser.user_id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'bg-danger';
      case 'seller': return 'bg-warning text-dark';
      case 'user': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'inactive': return 'bg-secondary';
      case 'blocked': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center py-80">
            <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-16 text-gray-500">Loading users...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-80">
      <div className="container container-lg">
        {/* Header */}
        <div className="flex-between flex-wrap gap-16 mb-32">
          <div>
            <h4 className="mb-8">Manage Users</h4>
            <p className="text-gray-600">View and manage all users in the system</p>
          </div>
          <Link to="/admin/dashboard" className="btn btn-outline-main">
            <i className="ph ph-arrow-left me-2"></i>
            Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="border border-gray-200 rounded-16 p-24 mb-32">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="col-md-2 d-flex align-items-end gap-2">
                <button type="submit" className="btn btn-main flex-grow-1">
                  <i className="ph ph-magnifying-glass me-2"></i>
                  Search
                </button>
                <button
                  type="button"
                  className="btn btn-outline-main"
                  onClick={resetFilters}
                  title="Reset Filters"
                >
                  <i className="ph ph-x"></i>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Stats */}
        <div className="row g-4 mb-32">
          <div className="col-md-3">
            <div className="border border-gray-200 rounded-16 p-24 text-center">
              <h3 className="text-main-600 mb-2">{pagination?.totalItems || 0}</h3>
              <p className="text-gray-600 mb-0">Total Users</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="border border-gray-200 rounded-16 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-gray-50">
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-80">
                      <i className="ph ph-users text-gray-300" style={{ fontSize: '64px' }}></i>
                      <p className="text-gray-500 mt-3">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.user_id}>
                      <td>#{user.user_id}</td>
                      <td>
                        <div className="flex-align gap-8">
                          {user.avatar_url ? (
                            <img
                              src={`${process.env.REACT_APP_IMAGE_URL}${user.avatar_url}`}
                              alt={user.full_name}
                              className="rounded-circle"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-main-50 flex-center"
                              style={{ width: '40px', height: '40px' }}
                            >
                              <i className="ph ph-user text-main-600"></i>
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold">{user.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || '-'}</td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <div className="flex-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="btn btn-sm btn-outline-main"
                            title="Edit User"
                          >
                            <i className="ph ph-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="btn btn-sm btn-outline-danger"
                            title="Delete User"
                            disabled={user.role === 'admin'}
                          >
                            <i className="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex-between mt-32">
            <div className="text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} users
            </div>
            <ul className="pagination flex-center gap-8">
              <li>
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="btn btn-outline-main btn-sm"
                >
                  <i className="ph ph-arrow-left"></i>
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
                    <li key={page}>
                      <button
                        onClick={() => handleFilterChange('page', page)}
                        className={`btn btn-sm ${
                          pagination.currentPage === page ? 'btn-main' : 'btn-outline-main'
                        }`}
                      >
                        {page}
                      </button>
                    </li>
                  );
                }
                return null;
              })}
              <li>
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="btn btn-outline-main btn-sm"
                >
                  <i className="ph ph-arrow-right"></i>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedUser?.full_name}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={selectedUser?.email}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-control"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-main"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-main"
                  onClick={saveUserChanges}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete user <strong>{selectedUser?.full_name}</strong>?</p>
                <p className="text-danger mb-0">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-main"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDeleteUser}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ManageUsers;