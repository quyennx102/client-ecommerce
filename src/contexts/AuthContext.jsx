import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import cartService from '../services/cartService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState(0); // Thêm trigger
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);

    // Hàm lấy số lượng giỏ hàng
    const fetchCartCount = useCallback(async () => {
        try {
            // Chỉ fetch khi đã đăng nhập
            if (localStorage.getItem('token')) {
                const response = await cartService.getCartSize();
                if (response.success) {
                    setCartCount(response.data.count); // Giả định API trả về { success: true, data: { count: 5 } }
                }
            }
        } catch (error) {
            console.error("Failed to fetch cart count:", error);
            setCartCount(0); // Đặt lại về 0 nếu có lỗi
        }
    }, []);

    // Hàm check auth có thể gọi từ bên ngoài
    const checkAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);
                await fetchCartCount();
            } else {
                setUser(null);
                setIsAuthenticated(false);
                setCartCount(0);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            setCartCount(0);
        } finally {
            setLoading(false);
        }
    }, [fetchCartCount]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                // Verify token is still valid
                const userData = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);

                // Optional: Validate token with backend
                // await authService.getCurrentUser();
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            const { user, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            setIsAuthenticated(true);
            await fetchCartCount();
            setUpdateTrigger(prev => prev + 1); // Trigger update

            return { success: true, user };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        setCartCount(0);
        setUpdateTrigger(prev => prev + 1); // Trigger update
    }, []);

    // Hàm updateUser để cập nhật từ bên ngoài
    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }, []);

    // Hàm force re-check auth state
    const refreshAuth = useCallback(() => {
        checkAuth();
    }, [checkAuth]);

    const getAccessToken = () => {
        return localStorage.getItem('token');
    };

    // Role checking functions
    const isAdmin = () => user?.role === 'admin';
    const isSeller = () => user?.role === 'seller';
    const isUser = () => user?.role === 'user';
    const hasRole = (role) => user?.role === role;
    const hasAnyRole = (roles) => roles.includes(user?.role);

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser, // Export updateUser
        refreshAuth, // Export refreshAuth
        checkAuth,   // Export checkAuth
        isAdmin,
        isSeller,
        isUser,
        hasRole,
        hasAnyRole,
        cartCount,
        fetchCartCount,
        getAccessToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};