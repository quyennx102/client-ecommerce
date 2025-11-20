import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick
  } = useNotification();

  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  const getNotificationIcon = (type) => {
    const icons = {
      'order': { icon: 'ph-shopping-cart', color: 'text-primary-600', bg: 'bg-primary-50' },
      'payment': { icon: 'ph-credit-card', color: 'text-success-600', bg: 'bg-success-50' },
      'product': { icon: 'ph-package', color: 'text-warning-600', bg: 'bg-warning-50' },
      'comment': { icon: 'ph-chat-circle', color: 'text-info-600', bg: 'bg-info-50' },
      'like': { icon: 'ph-heart', color: 'text-danger-600', bg: 'bg-danger-50' },
      'share': { icon: 'ph-share', color: 'text-purple-600', bg: 'bg-purple-50' },
      'follow': { icon: 'ph-user-plus', color: 'text-indigo-600', bg: 'bg-indigo-50' },
      'promotion': { icon: 'ph-tag', color: 'text-orange-600', bg: 'bg-orange-50' },
      'system': { icon: 'ph-info', color: 'text-gray-600', bg: 'bg-gray-50' }
    };
    return icons[type] || icons.system;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'Just now';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  if (loading) {
    return (
      <div className="container py-80">
        <div className="text-center">
          <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="mt-16">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="notifications-page py-80">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-32">
              <div>
                <h3 className="mb-8">Notifications</h3>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  className="btn btn-outline-main"
                  onClick={markAllAsRead}
                >
                  <i className="ph ph-check me-8"></i>
                  Mark all as read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="notification-filters mb-24">
              <div className="btn-group" role="group">
                <button
                  className={`btn ${filter === 'all' ? 'btn-main' : 'btn-outline-main'}`}
                  onClick={() => setFilter('all')}
                >
                  All ({notifications.length})
                </button>
                <button
                  className={`btn ${filter === 'unread' ? 'btn-main' : 'btn-outline-main'}`}
                  onClick={() => setFilter('unread')}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  className={`btn ${filter === 'read' ? 'btn-main' : 'btn-outline-main'}`}
                  onClick={() => setFilter('read')}
                >
                  Read ({notifications.length - unreadCount})
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-80">
                    <i className="ph ph-bell-slash text-gray-300" style={{ fontSize: '80px' }}></i>
                    <h5 className="mt-24 mb-8">No notifications</h5>
                    <p className="text-gray-500">
                      {filter === 'unread' 
                        ? "You don't have any unread notifications"
                        : filter === 'read'
                        ? "You don't have any read notifications"
                        : "You don't have any notifications yet"}
                    </p>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {filteredNotifications.map((notification, index) => {
                      const iconData = getNotificationIcon(notification.type);
                      
                      return (
                        <div
                          key={notification.notification_id}
                          className={`notification-item ${!notification.is_read ? 'unread' : ''} ${
                            index !== filteredNotifications.length - 1 ? 'border-bottom' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className={`notification-icon ${iconData.bg}`}>
                            <i className={`ph ${iconData.icon} ${iconData.color}`}></i>
                          </div>
                          
                          <div className="notification-content">
                            <div className="d-flex justify-content-between align-items-start mb-8">
                              <h6 className="notification-title mb-0">
                                {notification.title}
                                {!notification.is_read && (
                                  <span className="badge bg-main-600 text-white ms-8 text-xs">New</span>
                                )}
                              </h6>
                              <button
                                className="btn-icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.notification_id);
                                }}
                              >
                                <i className="ph ph-x text-gray-400"></i>
                              </button>
                            </div>
                            
                            <p className="notification-text mb-8">
                              {notification.content}
                            </p>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="notification-time text-gray-500 text-sm">
                                <i className="ph ph-clock me-4"></i>
                                {getTimeAgo(notification.created_at)}
                              </span>
                              
                              {!notification.is_read && (
                                <button
                                  className="btn btn-sm btn-outline-main"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.notification_id);
                                  }}
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotificationsPage;