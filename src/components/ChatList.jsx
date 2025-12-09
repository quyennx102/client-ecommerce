import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import chatService from '../services/chatService';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

const ChatList = () => {
  const { socket, isConnected } = useSocket(); // Use your SocketContext
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, []);

  // Listen for new messages via socket
  useEffect(() => {
    if (socket && isConnected) {
      const handleNewMessage = (data) => {
        console.log('New message in list:', data);
        // Refresh conversation list when new message arrives
        fetchConversations();
        fetchUnreadCount();
      };

      socket.on('new_message', handleNewMessage);
      
      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket, isConnected]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await chatService.getConversations();
      if (response.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Fetch conversations error:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await chatService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-80">
        <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-16 text-gray-500">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-80">
        <i className="ph ph-chat-circle-dots text-gray-300" style={{ fontSize: '80px' }}></i>
        <h5 className="mt-24 mb-16">No Conversations Yet</h5>
        <p className="text-gray-500 mb-32">
          Start chatting with stores to see your conversations here
        </p>
        <Link to="/products" className="btn btn-main px-40">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header p-24 border-bottom border-gray-100 bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Messages 
            {unreadCount > 0 && (
              <span className="badge bg-danger-600 text-white ms-8 rounded-pill">
                {unreadCount}
              </span>
            )}
          </h5>
          
          {/* Connection Status */}
          {!isConnected && (
            <span className="badge bg-warning text-dark">
              <i className="ph ph-wifi-slash me-4"></i>
              Reconnecting...
            </span>
          )}
        </div>
      </div>

      <div className="chat-list-items">
        {conversations.map((conv) => {
          const otherParty = conv.user_id === user.user_id 
            ? { ...conv.store, name: conv.store.store_name, avatar: conv.store.logo_url }
            : { ...conv.user, name: conv.user.full_name, avatar: conv.user.avatar_url };
          
          const unread = conv.user_id === user.user_id 
            ? conv.unread_count_user 
            : conv.unread_count_seller;

          return (
            <Link
              key={conv.conversation_id}
              to={`/chat/${conv.conversation_id}`}
              className={`chat-list-item p-24 border-bottom border-gray-100 d-flex gap-16 hover-bg-gray-50 transition-2 ${unread > 0 ? 'bg-main-50' : ''}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="position-relative">
                {otherParty.avatar ? (
                  <img
                    src={`${process.env.REACT_APP_IMAGE_URL}${otherParty.avatar}`}
                    alt={otherParty.name}
                    className="rounded-circle flex-shrink-0"
                    style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-main-50 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                       style={{ width: '56px', height: '56px' }}>
                    <i className={`ph ${conv.user_id === user.user_id ? 'ph-storefront' : 'ph-user'} text-main-600 text-2xl`}></i>
                  </div>
                )}
                
                {unread > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger-600">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>

              <div className="flex-grow-1 min-w-0">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <h6 className={`mb-0 text-truncate ${unread > 0 ? 'fw-bold' : ''}`}>
                    {otherParty.name}
                  </h6>
                  {conv.last_message_at && (
                    <span className="text-xs text-gray-500 flex-shrink-0 ms-8">
                      {formatMessageTime(conv.last_message_at)}
                    </span>
                  )}
                </div>

                {conv.lastMessage && (
                  <p className={`mb-0 text-sm text-gray-600 text-truncate ${unread > 0 ? 'fw-semibold' : ''}`}>
                    {conv.lastMessage.sender_id === user.user_id && (
                      <span className="me-4">You:</span>
                    )}
                    {conv.lastMessage.message}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to format message time
const formatMessageTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default ChatList;