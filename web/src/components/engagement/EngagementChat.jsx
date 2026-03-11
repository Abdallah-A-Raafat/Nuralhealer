import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import engagementChatService from '../../services/engagementChatService';
import engagementService from '../../services/engagementService';
import liveSessionService from '../../pages/livesession/liveSessionService';
import { showToast } from '../../utils/toast';
import { Send, ArrowLeft, Video } from 'lucide-react';

/**
 * EngagementChat Component
 * 
 * Patient-doctor messaging interface for active engagements.
 * Only accessible for verified, active engagements.
 * 
 * Features:
 * - Real-time messaging via STOMP over WebSocket (/ws -> /topic/engagement/{id})
 * - Message history (REST fallback)
 * - Access control (active engagements only)
 * - Auto-scroll to latest messages
 */
const EngagementChat = () => {
  const { engagementId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, role } = useAuth();
  const messagesEndRef = useRef(null);
  const stompRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [engagement, setEngagement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const wsUrl = useMemo(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const baseHost = apiBase.replace(/\/api$/, '');
    return baseHost.replace(/^http/, 'ws') + '/ws';
  }, []);

  const extractSessionIdFromText = (text) => {
    const callLinkRegex = /\/live-session\/native\/([a-zA-Z0-9-]+)/;
    const match = (text || '').match(callLinkRegex);
    return match?.[1] || null;
  };

  const extractLatestSessionId = (items = []) => {
    for (let i = items.length - 1; i >= 0; i--) {
      const sessionId = extractSessionIdFromText(items[i]?.message || items[i]?.content || '');
      if (sessionId) return sessionId;
    }
    return null;
  };

  const existingCallSessionId = useMemo(() => extractLatestSessionId(messages), [messages]);

  useEffect(() => {
    fetchEngagementAndMessages();
  }, [engagementId]);

  useEffect(() => {
    if (!hasAccess) return;

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe(`/topic/engagement/${engagementId}`, (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            const msg = payload?.metadata || payload;
            const mapped = mapIncomingMessage(msg);
            if (mapped) {
              setMessages((prev) => [...prev, mapped]);
            }
          } catch (err) {
            console.error('Failed to parse incoming message', err);
          }
        });
      },
      debug: () => {}
    });

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
      stompRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess, engagementId, wsUrl]);

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
      const currentEngagement = engagements.find(e => String(e.id) === String(engagementId));
      
      if (!currentEngagement) {
        showToast.error('Engagement not found');
        navigate('/profile');
        return;
      }
      
      if (currentEngagement.status?.toLowerCase() !== 'active') {
        showToast.error('This engagement is not active. Status: ' + currentEngagement.status);
        setHasAccess(false);
        setEngagement(currentEngagement);
        setIsLoading(false);
        return;
      }
      
      setEngagement(currentEngagement);
      setHasAccess(true);
      await fetchMessages(true, currentEngagement);
      
    } catch (error) {
      console.error('Error loading engagement chat:', error);
      showToast.error('Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (showLoading = false, engagementData = engagement) => {
    try {
      if (showLoading) setIsLoading(true);
      
      const response = await engagementChatService.getChatMessages(engagementId);
      const mapped = (response || []).map(mapIncomingMessage);
      setMessages(mapped.filter(Boolean));
      
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
      
      if (stompRef.current?.connected) {
        stompRef.current.publish({
          destination: `/app/engagement/${engagementId}/message`,
          body: JSON.stringify({ content: newMessage.trim() })
        });
        setNewMessage('');
      } else {
        const sentMessage = await engagementChatService.sendMessage(
          engagementId,
          newMessage.trim()
        );
        const mapped = mapIncomingMessage(sentMessage);
        setMessages(prev => [...prev, mapped]);
        setNewMessage('');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      showToast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const mapIncomingMessage = (msg) => {
    if (!msg) return null;

    const currentUserId = user?.userId || user?.id;
    const senderId = msg.senderId || msg.sender_id || msg.senderID;
    const senderIdStr = senderId ? String(senderId) : null;
    const isCurrentUser = currentUserId && senderIdStr && String(currentUserId) === senderIdStr;
    const effectiveRole = role || user?.role || 'PATIENT';
    const isSystem = !!msg.isSystemMessage; // Only trust explicit flag from backend
    const senderType = isCurrentUser
      ? (effectiveRole === 'DOCTOR' ? 'DOCTOR' : 'PATIENT')
      : (effectiveRole === 'DOCTOR' ? 'PATIENT' : 'DOCTOR');

    return {
      id: msg.id || msg.messageId,
      engagementId: msg.engagementId || engagementId,
      senderId: senderIdStr,
      senderName: msg.senderName || (msg.isSystemMessage ? 'System' : 'Unknown'),
      senderType,
      message: msg.content || msg.message || '',
      isSystemMessage: isSystem,
      isMine: !!isCurrentUser,
      isRead: !!msg.readAt || !!msg.isRead,
      timestamp: msg.sentAt || msg.timestamp || new Date().toISOString()
    };
  };

  const getParticipantName = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user?.name || user?.email || (role === 'DOCTOR' ? 'Doctor' : 'Patient');
  };

  const handleStartVideoCall = async () => {
    if (!hasAccess || !engagementId) {
      showToast.error('Video calls are only available for active engagements');
      return;
    }

    try {
      setIsStartingCall(true);

      // Always refresh from backend first to avoid race conditions between users.
      const latestMessages = await engagementChatService.getChatMessages(engagementId);
      const latestSessionId = extractLatestSessionId(latestMessages || []);

      if (latestSessionId) {
        navigate(`/live-session/native/${latestSessionId}`);
        return;
      }

      // Prevent creating separate rooms from both sides.
      const normalizedRole = String(role || user?.role || '').toUpperCase();
      if (normalizedRole !== 'DOCTOR') {
        showToast.info('No active call yet. Please wait for the doctor to start the video call.');
        return;
      }

      const session = await liveSessionService.create(getParticipantName(), 'native-webrtc');
      const callLink = `${window.location.origin}/live-session/native/${session.sessionId}`;

      try {
        await engagementChatService.sendMessage(
          engagementId,
          `📹 Video call started. Join here: ${callLink}`
        );
      } catch (notifyError) {
        console.warn('Failed to post video call link in chat:', notifyError);
      }

      navigate(`/live-session/native/${session.sessionId}`);
    } catch (error) {
      console.error('Error starting video call:', error);
      showToast.error('Failed to start video call');
    } finally {
      setIsStartingCall(false);
    }
  };

  const renderMessageContent = (content) => {
    const text = content || '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium break-all"
          >
            {part}
          </a>
        );
      }

      return <span key={`text-${index}`}>{part}</span>;
    });
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
            <Button
              type="button"
              variant="outline"
              onClick={handleStartVideoCall}
              disabled={isStartingCall || !hasAccess}
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              {isStartingCall ? 'Starting...' : existingCallSessionId ? 'Join Video Call' : 'Video Call'}
            </Button>
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
            messages.map((message) => {
              const wrapperClass = message.isSystemMessage
                ? 'justify-center'
                : message.isMine
                  ? 'justify-end'
                  : 'justify-start';

              return (
                <div key={message.id} className={`flex w-full ${wrapperClass}`}>
                  {message.isSystemMessage ? (
                    <div className="bg-gray-200/80 dark:bg-gray-700/70 text-gray-700 dark:text-gray-100 text-xs px-4 py-2 rounded-full shadow-sm">
                      {message.message}
                    </div>
                  ) : (
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                        message.isMine
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white dark:bg-[#241D30] text-textPrimary dark:text-white border border-gray-200 dark:border-[#3F3651] rounded-bl-sm'
                      }`}
                    >
                      {!message.isMine && (
                        <p className="text-xs font-medium text-textSecondary dark:text-gray-400 mb-1">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {renderMessageContent(message.message)}
                      </p>
                      <p
                        className={`text-[11px] mt-2 ${
                          message.isMine ? 'text-white/70' : 'text-textSecondary dark:text-gray-500'
                        }`}
                      >
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
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
