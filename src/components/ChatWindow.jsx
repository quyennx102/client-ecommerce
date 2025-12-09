import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import chatService from '../services/chatService';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

const ChatWindow = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket(); // Use your SocketContext
    const { user } = useAuth();

    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);
    const messageContainerRef = useRef(null);

    useEffect(() => {
        if (conversationId) {
            fetchConversation();
            fetchMessages();
            markAsRead();
        }
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Join conversation room when connected
    useEffect(() => {
        if (socket && isConnected && conversationId) {
            socket.emit('join_conversation', conversationId);
            console.log(`Joined conversation: ${conversationId}`);

            return () => {
                socket.emit('leave_conversation', conversationId);
                console.log(`Left conversation: ${conversationId}`);
            };
        }
    }, [socket, isConnected, conversationId]);

    // Listen for new messages via socket
    useEffect(() => {
        if (socket && isConnected) {

            const handleNewMessage = (data) => {
                console.log('New message received:', data);
                if (data.conversation_id == conversationId) {
                    setMessages(prev => {
                        const exists = prev.some(msg => msg.message_id === data.message.message_id);
                        if (exists) return prev; // Đã tồn tại, không thêm
                        return [...prev, data.message];
                    });
                    markAsRead();
                    scrollToBottom();
                }
            };

            socket.on('new_message', handleNewMessage);

            return () => {
                socket.off('new_message', handleNewMessage);
            };
        }
    }, [socket, isConnected, conversationId]);

    const fetchConversation = async () => {
        try {
            const response = await chatService.getConversations();
            if (response.success) {
                const conv = response.data.conversations.find(
                    c => c.conversation_id == conversationId
                );
                if (conv) {
                    setConversation(conv);
                } else {
                    toast.error('Conversation not found');
                    navigate('/chat');
                }
            }
        } catch (error) {
            console.error('Fetch conversation error:', error);
            toast.error('Failed to load conversation');
        }
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await chatService.getMessages(conversationId);
            if (response.success) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            console.error('Fetch messages error:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await chatService.markAsRead(conversationId);
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        const messageToSend = newMessage.trim();
        setNewMessage('');

        setSending(true);
        try {
            const response = await chatService.sendMessage(conversationId, {
                message: messageToSend
            });

            if (response.success) {
                setMessages(prev => [...prev, response.data]);
            }
        } catch (error) {
            console.error('Send message error:', error);
            toast.error('Failed to send message');
            setNewMessage(messageToSend);
        } finally {
            setSending(false);
        }
    };
    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTo({
                top: messageContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '600px' }}>
                <div className="text-center">
                    <div className="spinner-border text-main-600" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="mt-16 text-gray-500">Loading conversation...</p>
                </div>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="text-center py-80">
                <i className="ph ph-chat-circle-dots text-gray-300" style={{ fontSize: '80px' }}></i>
                <h5 className="mt-24 mb-16">Conversation not found</h5>
                <Link to="/chat" className="btn btn-main mt-24">Back to Chats</Link>
            </div>
        );
    }

    const otherParty = conversation.user_id === user.user_id
        ? { ...conversation.store, name: conversation.store.store_name, avatar: conversation.store.logo_url }
        : { ...conversation.user, name: conversation.user.full_name, avatar: conversation.user.avatar_url };

    return (
        <div className="chat-window border border-gray-100 rounded-16 shadow-sm" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <div className="chat-header p-24 border-bottom border-gray-100 bg-white rounded-top-16">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-16">
                        <Link to="/chat" className="text-gray-600 hover-text-main-600">
                            <i className="ph ph-arrow-left text-2xl"></i>
                        </Link>
                        {otherParty.avatar ? (
                            <img
                                src={`${process.env.REACT_APP_IMAGE_URL}${otherParty.avatar}`}
                                alt={otherParty.name}
                                className="rounded-circle"
                                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="bg-main-50 rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '48px', height: '48px' }}>
                                <i className="ph ph-storefront text-main-600 text-2xl"></i>
                            </div>
                        )}
                        <div>
                            <h6 className="mb-0">{otherParty.name}</h6>
                            {conversation.user_id === user.user_id && (
                                <Link
                                    to={`/stores/${conversation.store_id}/products`}
                                    className="text-sm text-gray-600 hover-text-main-600"
                                >
                                    View Store
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Connection Status Indicator */}
                    <div className="d-flex align-items-center gap-8">
                        <span className={`badge ${isConnected ? 'bg-success' : 'bg-warning'} text-white`}>
                            {isConnected ? (
                                <>
                                    <i className="ph ph-wifi-high me-4"></i>
                                    Connected
                                </>
                            ) : (
                                <>
                                    <i className="ph ph-wifi-slash me-4"></i>
                                    Connecting...
                                </>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div
                ref={messageContainerRef}
                className="chat-messages flex-grow-1 p-24 overflow-auto"
                style={{ backgroundColor: '#f8f9fa' }}
            >
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-40">
                        <i className="ph ph-chat-circle-dots text-6xl mb-16 text-gray-300"></i>
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isOwnMessage = msg.sender_id === user.user_id;
                        const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].sender_id !== msg.sender_id);

                        return (
                            <div
                                key={msg.message_id || `temp-${index}`}
                                className={`d-flex gap-12 mb-16 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                            >
                                {showAvatar && msg.sender?.avatar_url && (
                                    <img
                                        src={`${process.env.REACT_APP_IMAGE_URL}${msg.sender.avatar_url}`}
                                        alt={msg.sender.full_name}
                                        className="rounded-circle flex-shrink-0"
                                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                    />
                                )}

                                {!showAvatar && !isOwnMessage && (
                                    <div style={{ width: '32px' }}></div>
                                )}

                                <div className={`message-bubble ${isOwnMessage ? 'bg-main-600 text-white' : 'bg-white'} rounded-16 p-12 shadow-sm`}
                                    style={{ maxWidth: '70%', wordWrap: 'break-word' }}>
                                    <p className="mb-4" style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                                    <div className="d-flex align-items-center gap-8">
                                        <span className={`text-xs ${isOwnMessage ? 'text-white opacity-75' : 'text-gray-500'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isOwnMessage && (
                                            <i className={`ph ${msg.is_read ? 'ph-checks' : 'ph-check'} text-xs ${isOwnMessage ? 'text-white opacity-75' : 'text-gray-500'}`}></i>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="chat-input p-24 border-top border-gray-100 bg-white rounded-bottom-16">
                <div className="d-flex gap-12 align-items-end">
                    <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                        style={{ resize: 'none' }}
                        maxLength={1000}
                    />
                    <button
                        type="submit"
                        className="btn btn-main px-24 py-12 flex-shrink-0"
                        disabled={sending || !newMessage.trim() || !isConnected}
                        title={!isConnected ? 'Connecting...' : 'Send message'}
                    >
                        {sending ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            <i className="ph ph-paper-plane-right text-xl"></i>
                        )}
                    </button>
                </div>
                {newMessage.length > 950 && (
                    <small className="text-gray-500 mt-8 d-block">
                        {1000 - newMessage.length} characters remaining
                    </small>
                )}
            </form>
        </div>
    );
};

export default ChatWindow;