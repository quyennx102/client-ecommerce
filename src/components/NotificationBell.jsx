import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import './NotificationBell.css';

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick
  } = useNotification();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    const icons = {
      'order': 'ph-shopping-cart',
      'payment': 'ph-credit-card',
      'product': 'ph-package',
      'comment': 'ph-chat-circle',
      'like': 'ph-heart',
      'share': 'ph-share',
      'follow': 'ph-user-plus',
      'promotion': 'ph-tag',
      'system': 'ph-info'
    };
    return icons[type] || 'ph-bell';
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

  const displayedNotifications = notifications.slice(0, 5);

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="notification-bell__button flex-align flex-column gap-8 item-hover-two border-0 bg-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-2xl text-white d-flex position-relative item-hover__text">
          <i className="ph ph-bell"></i>
          {unreadCount > 0 && (
            <span className="notification-bell__badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
        <span className="text-md text-white item-hover__text d-none d-lg-flex">
          Notifications
        </span>
      </button>

      {isOpen && (
        <div className="notification-bell__dropdown">
          <div className="notification-bell__header">
            <h6 className="mb-0">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn-link text-sm"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-bell__list">
            {displayedNotifications.length === 0 ? (
              <div className="notification-bell__empty">
                <i className="ph ph-bell-slash text-gray-400" style={{ fontSize: '48px' }}></i>
                <p className="text-gray-500 mt-16">No notifications yet</p>
              </div>
            ) : (
              displayedNotifications.map(notification => (
                <div
                  key={notification.notification_id}
                  className={`notification-bell__item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => {
                    handleNotificationClick(notification);
                    setIsOpen(false);
                  }}
                >
                  <div className="notification-bell__item-icon">
                    <i className={`ph ${getNotificationIcon(notification.type)}`}></i>
                  </div>
                  <div className="notification-bell__item-content">
                    <h6 className="notification-bell__item-title">
                      {notification.title}
                    </h6>
                    <p className="notification-bell__item-text">
                      {notification.content}
                    </p>
                    <span className="notification-bell__item-time">
                      {getTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  {!notification.is_read && (
                    <span className="notification-bell__item-dot"></span>
                  )}
                  <button
                    className="notification-bell__item-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.notification_id);
                    }}
                  >
                    <i className="ph ph-x"></i>
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 5 && (
            <Link
              to="/notifications"
              className="notification-bell__footer"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;