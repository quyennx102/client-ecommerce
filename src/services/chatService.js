import axiosInstance from '../utils/axios';

const chatService = {
  // Get or create conversation with a store
  getOrCreateConversation: async (storeId) => {
    const response = await axiosInstance.post('/chat/conversations', {
      store_id: storeId
    });
    return response.data;
  },

  // Get all conversations
  getConversations: async (params = {}) => {
    const response = await axiosInstance.get('/chat/conversations', { params });
    return response.data;
  },

  // Get messages in a conversation
  getMessages: async (conversationId, params = {}) => {
    const response = await axiosInstance.get(`/chat/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  // Send a message
  sendMessage: async (conversationId, messageData) => {
    const response = await axiosInstance.post(`/chat/conversations/${conversationId}/messages`, messageData);
    return response.data;
  },

  // Mark conversation as read
  markAsRead: async (conversationId) => {
    const response = await axiosInstance.patch(`/chat/conversations/${conversationId}/read`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/chat/unread-count');
    return response.data;
  }
};

export default chatService;