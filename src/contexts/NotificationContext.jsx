import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  // Listen for new notifications via socket
  useEffect(() => {
    if (socket && isAuthenticated) {
      socket.on('new_notification', (notification) => {
        console.log('New notification received:', notification);
        
        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);
        
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast.info(notification.title, {
          position: 'top-right',
          autoClose: 5000,
          onClick: () => {
            // Navigate to notification detail
            handleNotificationClick(notification);
          }
        });
      });

      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket, isAuthenticated]);

  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification.notification_id);
    
    // Navigate based on reference type
    if (notification.reference_type && notification.reference_id) {
      const routes = {
        'order': `/orders/${notification.reference_id}`,
        'product': `/product/${notification.reference_id}`,
        'post': `/posts/${notification.reference_id}`,
        'comment': `/posts/${notification.reference_id}`
      };
      
      const route = routes[notification.reference_type];
      if (route) {
        window.location.href = route;
      }
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notificationId
            ? { ...n, is_read: true }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      setUnreadCount(0);
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      const notification = notifications.find(n => n.notification_id === notificationId);
      setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Delete notification error:', error);
      toast.error('Failed to delete notification');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        handleNotificationClick
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};