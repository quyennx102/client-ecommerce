import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import chatService from '../services/chatService';

const ChatButton = ({ storeId, storeName }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    // Check if logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please login to chat with this store');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const response = await chatService.getOrCreateConversation(storeId);
      
      if (response.success) {
        // Navigate to chat page with conversation
        navigate(`/chat/${response.data.conversation_id}`);
      }
    } catch (error) {
      console.error('Start chat error:', error);
      toast.error(error.response?.data?.message || 'Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className="btn btn-outline-main rounded-8 py-12 px-24 flex-center gap-8"
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm"></span>
          Loading...
        </>
      ) : (
        <>
          <i className="ph ph-chat-circle-dots text-lg"></i>
          Chat with {storeName || 'Store'}
        </>
      )}
    </button>
  );
};

export default ChatButton;