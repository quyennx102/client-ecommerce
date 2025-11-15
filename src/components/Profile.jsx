import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';

const Profile = () => {
    const { user, updateUser, isAdmin, isSeller } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        date_of_birth: '',
        gender: ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    // Orders state (mock data - bạn có thể thay bằng API thực tế)
    const [orders, setOrders] = useState([]);
    const [stores, setStores] = useState([]);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                date_of_birth: user.date_of_birth || '',
                gender: user.gender || ''
            });
        }
        loadUserData();
    }, [user]);

    const loadUserData = async () => {
        try {
            // Load orders
            // const ordersResponse = await orderService.getUserOrders();
            // setOrders(ordersResponse.data);

            // Load stores if seller
            if (isSeller()) {
                // const storesResponse = await storeService.getUserStores();
                // setStores(storesResponse.data);
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await userService.updateProfile(formData);
            if (response.success) {
                updateUser(response.data.user); // Giả sử API trả về user data
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('New passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await userService.changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });

            if (response.success) {
                toast.success('Password updated successfully!');
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = () => {
        const badges = {
            admin: 'bg-danger',
            seller: 'bg-warning text-dark',
            user: 'bg-secondary'
        };
        return badges[user?.role] || 'bg-secondary';
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: 'bg-warning text-dark',
            processing: 'bg-info',
            shipped: 'bg-primary',
            delivered: 'bg-success',
            cancelled: 'bg-danger'
        };
        return statusMap[status] || 'bg-secondary';
    };

    const getStatusText = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setLoading(true);

        try {
            const response = await userService.uploadImage(file);
            if (response.success) {
                // Reload user data to get updated image
                const userResponse = await userService.getProfile();
                updateUser(userResponse.data);
                toast.success('Profile image updated successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    // Mock orders data - replace with actual API call
    const mockOrders = [
        {
            id: 'ORD-001',
            date: '2024-01-15',
            total: 1250000,
            status: 'delivered',
            items: 3
        },
        {
            id: 'ORD-002',
            date: '2024-01-10',
            total: 750000,
            status: 'shipped',
            items: 2
        },
        {
            id: 'ORD-003',
            date: '2024-01-05',
            total: 450000,
            status: 'pending',
            items: 1
        }
    ];

    // Mock stores data - replace with actual API call
    const mockStores = [
        {
            id: 1,
            name: 'Tech Store',
            products: 24,
            sales: 45,
            status: 'active'
        },
        {
            id: 2,
            name: 'Fashion Hub',
            products: 15,
            sales: 23,
            status: 'active'
        }
    ];

    return (
        <section className="py-80">
            <div className="container container-lg">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-lg-3 mb-4">
                        <div className="border border-gray-200 rounded-16 p-24 bg-white">
                            {/* User Info Card */}
                            <div className="text-center mb-24">
                                <div className="w-80 h-80 bg-main-100 rounded-circle flex-center mx-auto mb-3">
                                    <i className="ph ph-user text-main-600 text-2xl"></i>
                                </div>
                                <h5 className="mb-2">{user?.full_name}</h5>
                                <span className={`badge ${getRoleBadge()} px-3 py-2`}>
                                    {user?.role?.toUpperCase()}
                                </span>
                                <p className="text-gray-500 text-sm mt-2">{user?.email}</p>
                            </div>

                            {/* Navigation */}
                            <nav className="profile-nav">
                                <ul className="nav flex-column gap-2">
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link text-start w-100 py-3 px-3 rounded-8 border-0 bg-transparent ${activeTab === 'profile' ? 'bg-main-50 text-main-600' : 'text-gray-600 hover-bg-gray-50'
                                                }`}
                                            onClick={() => setActiveTab('profile')}
                                        >
                                            <i className="ph ph-user me-2"></i>
                                            Profile Information
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link text-start w-100 py-3 px-3 rounded-8 border-0 bg-transparent ${activeTab === 'password' ? 'bg-main-50 text-main-600' : 'text-gray-600 hover-bg-gray-50'
                                                }`}
                                            onClick={() => setActiveTab('password')}
                                        >
                                            <i className="ph ph-lock me-2"></i>
                                            Change Password
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link text-start w-100 py-3 px-3 rounded-8 border-0 bg-transparent ${activeTab === 'orders' ? 'bg-main-50 text-main-600' : 'text-gray-600 hover-bg-gray-50'
                                                }`}
                                            onClick={() => setActiveTab('orders')}
                                        >
                                            <i className="ph ph-shopping-cart me-2"></i>
                                            My Orders
                                            <span className="badge bg-main-600 ms-2">{mockOrders.length}</span>
                                        </button>
                                    </li>

                                    {/* Seller Specific Tabs */}
                                    {isSeller() && (
                                        <>
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link text-start w-100 py-3 px-3 rounded-8 border-0 bg-transparent ${activeTab === 'stores' ? 'bg-warning bg-opacity-10 text-warning' : 'text-gray-600 hover-bg-gray-50'
                                                        }`}
                                                    onClick={() => setActiveTab('stores')}
                                                >
                                                    <i className="ph ph-storefront me-2"></i>
                                                    My Stores
                                                    <span className="badge bg-warning ms-2">{mockStores.length}</span>
                                                </button>
                                            </li>
                                            <li className="nav-item">
                                                <Link
                                                    to="/seller/dashboard"
                                                    className="nav-link text-start w-100 py-3 px-3 rounded-8 border-0 bg-transparent text-warning hover-bg-warning hover-bg-opacity-10"
                                                >
                                                    <i className="ph ph-gauge me-2"></i>
                                                    Seller Dashboard
                                                </Link>
                                            </li>
                                        </>
                                    )}

                                    {/* Admin Specific Tabs */}
                                    {isAdmin() && (
                                        <>
                                            <li className="nav-item">
                                                <Link
                                                    to="/admin/dashboard"
                                                    className="nav-link text-start w-100 py-3 px-3 rounded-8 border-0 bg-transparent text-danger hover-bg-danger hover-bg-opacity-10"
                                                >
                                                    <i className="ph ph-gauge me-2"></i>
                                                    Admin Dashboard
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-lg-9">
                        <div className="border border-gray-200 rounded-16 p-24 bg-white">

                            {/* Profile Information Tab */}
                            {activeTab === 'profile' && (
                                <div>
                                    <h4 className="mb-4">Profile Information</h4>
                                    <form onSubmit={handleProfileUpdate}>
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="common-input"
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Email Address</label>
                                                <input
                                                    type="email"
                                                    className="common-input"
                                                    value={formData.email}
                                                    disabled
                                                />
                                                <small className="text-gray-500">Email cannot be changed</small>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    className="common-input"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    className="common-input"
                                                    name="date_of_birth"
                                                    value={formData.date_of_birth}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Gender</label>
                                                <select
                                                    className="common-input"
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label fw-medium">Address</label>
                                                <textarea
                                                    className="common-input"
                                                    rows="3"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your address"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <button
                                                    type="submit"
                                                    className="btn btn-main py-8 px-10"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        'Update Profile'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Change Password Tab */}
                            {activeTab === 'password' && (
                                <div>
                                    <h4 className="mb-4">Change Password</h4>
                                    <form onSubmit={handlePasswordUpdate}>
                                        <div className="row g-4">
                                            <div className="col-12">
                                                <label className="form-label fw-medium">Current Password</label>
                                                <input
                                                    type="password"
                                                    className="common-input"
                                                    name="current_password"
                                                    value={passwordData.current_password}
                                                    onChange={handlePasswordChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">New Password</label>
                                                <input
                                                    type="password"
                                                    className="common-input"
                                                    name="new_password"
                                                    value={passwordData.new_password}
                                                    onChange={handlePasswordChange}
                                                    required
                                                />
                                                <small className="text-gray-500">Minimum 8 characters</small>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    className="common-input"
                                                    name="confirm_password"
                                                    value={passwordData.confirm_password}
                                                    onChange={handlePasswordChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12">
                                                <button
                                                    type="submit"
                                                    className="btn btn-main py-3 px-5"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        'Change Password'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="mb-0">My Orders</h4>
                                        <span className="text-gray-500">{mockOrders.length} orders</span>
                                    </div>

                                    {mockOrders.length === 0 ? (
                                        <div className="text-center py-5">
                                            <i className="ph ph-shopping-cart text-gray-300 text-6xl mb-3"></i>
                                            <h5 className="mb-2">No Orders Yet</h5>
                                            <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
                                            <Link to="/products" className="btn btn-main">
                                                Start Shopping
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th>Order ID</th>
                                                        <th>Date</th>
                                                        <th>Items</th>
                                                        <th>Total</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mockOrders.map((order) => (
                                                        <tr key={order.id}>
                                                            <td className="fw-medium">{order.id}</td>
                                                            <td>{new Date(order.date).toLocaleDateString()}</td>
                                                            <td>{order.items} items</td>
                                                            <td className="fw-bold text-main-600">
                                                                {order.total.toLocaleString('vi-VN')}đ
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${getStatusBadge(order.status)} px-3 py-2`}>
                                                                    {getStatusText(order.status)}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button className="btn btn-sm btn-outline-main">
                                                                    View Details
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Stores Tab (Seller Only) */}
                            {activeTab === 'stores' && isSeller() && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="mb-0">My Stores</h4>
                                        <Link to="/seller/stores/create" className="btn btn-warning">
                                            <i className="ph ph-plus me-2"></i>
                                            Add New Store
                                        </Link>
                                    </div>

                                    {mockStores.length === 0 ? (
                                        <div className="text-center py-5">
                                            <i className="ph ph-storefront text-gray-300 text-6xl mb-3"></i>
                                            <h5 className="mb-2">No Stores Yet</h5>
                                            <p className="text-gray-500 mb-4">Start by creating your first store</p>
                                            <Link to="/seller/stores/create" className="btn btn-warning">
                                                Create Store
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="row g-4">
                                            {mockStores.map((store) => (
                                                <div key={store.id} className="col-md-6">
                                                    <div className="border border-gray-200 rounded-16 p-4 hover-shadow transition-1">
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <h5 className="mb-0">{store.name}</h5>
                                                            <span className="badge bg-success">Active</span>
                                                        </div>
                                                        <div className="row text-center">
                                                            <div className="col-6">
                                                                <div className="text-lg fw-bold text-main-600">{store.products}</div>
                                                                <div className="text-sm text-gray-500">Products</div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="text-lg fw-bold text-warning">{store.sales}</div>
                                                                <div className="text-sm text-gray-500">Sales</div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 d-flex gap-2">
                                                            <Link
                                                                to={`/seller/stores/${store.id}/products`}
                                                                className="btn btn-sm btn-outline-main flex-1"
                                                            >
                                                                Manage Products
                                                            </Link>
                                                            <button className="btn btn-sm btn-outline-warning">
                                                                <i className="ph ph-pencil"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Profile;