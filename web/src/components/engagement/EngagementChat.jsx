import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import engagementChatService from '../../services/engagementChatService';
import engagementService from '../../services/engagementService';
import { showToast } from '../../utils/toast';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';

/**
 * EngagementChat Component
 * 
 * Patient-doctor messaging interface for active engagements.
 * Only accessible for verified, active engagements.
 * 
 * Features:
 * - Real-time messaging
 * - Message history with pagination
 * - Read receipts
 * - Access control (active engagements only)
 * - Auto-scroll to latest messages
 */
const EngagementChat = () => {
  const { engagementId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [engagement, setEngagement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    fetchEngagementAndMessages();
    
    // Poll for new messages every 5 seconds (replace with WebSocket in production)
    const interval = setInterval(() => {
      if (hasAccess) {
        fetchMessages(false);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [engagementId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchEngagementAndMessages = async () => {
    try {
      setIsLoading(true);
      
      // Fetch engagement details
      const engagements = await engagementService.getMyEngagements();
      console.log('All engagements:', engagements);
      console.log('Looking for engagement ID:', engagementId);
      
      const currentEngagement = engagements.find(e => 
        String(e.id) === String(engagementId) || e.id === parseInt(engagementId)
      );
      
      if (!currentEngagement) {
        console.error('Engagement not found. Available IDs:', engagements.map(e => e.id));
        showToast.error('Engagement not found');
        navigate('/profile');
        return;
      }
      
      console.log('Found engagement:', currentEngagement);
      console.log('Engagement status:', currentEngagement.status);
      
      // Check if engagement is active (case-insensitive)
      if (currentEngagement.status?.toLowerCase() !== 'active') {
        showToast.error('This engagement is not active. Status: ' + currentEngagement.status);
        setHasAccess(false);
        setEngagement(currentEngagement);
        setIsLoading(false);
        return;
      }
      
      setEngagement(currentEngagement);
      setHasAccess(true);
      
      // Fetch messages
      await fetchMessages(true);
      
    } catch (error) {
      console.error('Error loading engagement chat:', error);
      showToast.error('Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      
      const response = await engagementChatService.getChatMessages(parseInt(engagementId));
      setMessages(response.content || []);
      
      // Mark unread messages as read
      const unreadMessages = response.content.filter(
        msg => !msg.isRead && msg.senderType === 'DOCTOR'
      );
      
      for (const msg of unreadMessages) {
        await engagementChatService.markAsRead(msg.id);
      }
      
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    if (!hasAccess) {
      showToast.error('You don\'t have access to send messages');
      return;
    }
    
    try {
      setIsSending(true);
      
      const sentMessage = await engagementChatService.sendMessage(
        parseInt(engagementId),
        newMessage.trim()
      );
      
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      showToast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1A1625] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1A1625] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-textPrimary dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-textSecondary dark:text-gray-400 mb-6">
              This engagement is not active. You can only chat with active engagements.
            </p>
            <Button variant="primary" onClick={() => navigate('/profile')}>
              Back to Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1A1625] flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-[#241D30] border-b border-gray-200 dark:border-[#3F3651] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#2A2235] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-textPrimary dark:text-white" />
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-textPrimary dark:text-white">
                {engagement?.doctorName || 'Doctor'}
              </h1>
              <p className="text-sm text-textSecondary dark:text-gray-400">
                {engagement?.doctorSpecialization || 'Mental Health Professional'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-textSecondary dark:text-gray-400">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderType === 'PATIENT' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.senderType === 'PATIENT'
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-[#241D30] text-textPrimary dark:text-white border border-gray-200 dark:border-[#3F3651]'
                  }`}
                >
                  {message.senderType === 'DOCTOR' && (
                    <p className="text-xs font-medium text-textSecondary dark:text-gray-400 mb-1">
                      {message.senderName}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.message}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.senderType === 'PATIENT'
                        ? 'text-white/70'
                        : 'text-textSecondary dark:text-gray-500'
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-[#241D30] border-t border-gray-200 dark:border-[#3F3651] p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-[#3F3651] rounded-lg bg-white dark:bg-[#1A1625] text-textPrimary dark:text-white placeholder-textSecondary dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSending}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!newMessage.trim() || isSending}
              className="px-6"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EngagementChat;
