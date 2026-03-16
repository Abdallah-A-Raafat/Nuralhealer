import { useState, useEffect, useRef } from 'react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ChatSidebar from '../../components/chat/ChatSidebar';
import { useAiChat } from '../../hooks/useAiChat';
import { useLanguage } from '../../hooks/useLanguage';
import { chatService } from '../../services/chatService';
import engagementService from '../../services/engagementService';
import { showToast } from '../../utils/toast';

const Chat = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t } = useLanguage();

  if (selectedSession === 'text') {
    return <TextSession onBack={() => setSelectedSession(null)} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
  }

  if (selectedSession === 'sound') {
    return <SoundSession onBack={() => setSelectedSession(null)} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-textPrimary mb-4">{t.chat.aiTherapySession}</h1>
          <p className="text-lg text-textSecondary">
            {t.chat.chooseConnection}
          </p>
        </div>

        {/* Session Options */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Text Session Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-textPrimary text-center mb-2">{t.chat.textSession}</h2>
              <p className="text-textSecondary text-center">
                {t.chat.textSessionDesc}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <p className="text-sm font-semibold text-textPrimary">{t.chat.features}:</p>
              <ul className="text-sm text-textSecondary space-y-1">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t.chat.realTimeAiResponses}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t.chat.sessionTranscriptSaved}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t.chat.emotionAnalysisIncluded}
                </li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="large"
              className="w-full"
              onClick={() => setSelectedSession('text')}
            >
              {t.chat.startTextSession}
            </Button>
          </div>

          {/* Sound Session Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-textPrimary text-center mb-2">{t.chat.soundSession}</h2>
              <p className="text-textSecondary text-center">
                {t.chat.soundSessionDesc}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <p className="text-sm font-semibold text-textPrimary">{t.chat.features}:</p>
              <ul className="text-sm text-textSecondary space-y-1">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t.chat.voiceToTextConversion}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t.chat.naturalConversationFlow}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t.chat.aiVoiceResponses}
                </li>
              </ul>
            </div>

            <Button
              variant="secondary"
              size="large"
              className="w-full"
              onClick={() => setSelectedSession('sound')}
            >
              {t.chat.startSoundSession}
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-3xl mx-auto mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 {t.chat.tip}</h3>
          <p className="text-blue-800 text-sm">
            {t.chat.tipText}
          </p>
        </div>
      </div>
    </div>
  );
};

// Text Session Component
const TextSession = ({ onBack, sidebarOpen, setSidebarOpen }) => {
  const { 
    messages, 
    isConnected, 
    isAiTyping, 
    connectionStatus,
    error,
    sessions,
    currentSession,
    isLoadingHistory,
    isLoadingMessages,
    sendMessage,
    reconnect,
    loadSession,
    createNewSession,
    fetchSessions,
    renameSession
  } = useAiChat();
  const { t } = useLanguage();
  const messagesEndRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [authorizedDoctors, setAuthorizedDoctors] = useState([]);
  const [loadingAuthorized, setLoadingAuthorized] = useState(false);
  const [authorizedError, setAuthorizedError] = useState('');
  const [engagements, setEngagements] = useState([]);
  const [loadingEngagements, setLoadingEngagements] = useState(false);

  // Prevent page-level scrollbar while in text session
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow || '';
      document.body.style.overflow = prevBodyOverflow || '';
    };
  }, []);

  useEffect(() => {
    const loadAuthorized = async () => {
      try {
        setLoadingAuthorized(true);
        setAuthorizedError('');
        const data = await chatService.getAuthorizedDoctors();
        setAuthorizedDoctors(data || []);
      } catch (err) {
        console.error('Failed to load authorized doctors', err);
        setAuthorizedError('Could not load authorized doctors');
      } finally {
        setLoadingAuthorized(false);
      }
    };

    loadAuthorized();
  }, []);

  useEffect(() => {
    const loadEngagements = async () => {
      try {
        setLoadingEngagements(true);
        const data = await engagementService.getMyEngagements();
        setEngagements(data || []);
      } catch (err) {
        console.error('Failed to load engagements', err);
      } finally {
        setLoadingEngagements(false);
      }
    };

    loadEngagements();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const sent = await sendMessage(inputValue);
    if (sent) {
      setInputValue('');
      // Refresh sessions after sending a message to update the history
      setTimeout(() => fetchSessions(), 500);
    }
  };

  const handleSelectSession = (sessionId) => {
    loadSession(sessionId);
  };

  const handleNewChat = () => {
    createNewSession();
  };

  const handleRenameSession = async (sessionId, newTitle) => {
    try {
      await renameSession(sessionId, newTitle);
      showToast.success(t.chat?.sessionRenamed || 'Session renamed successfully');
      // Refresh sessions to get updated data
      await fetchSessions();
    } catch (error) {
      console.error('Failed to rename session:', error);
      showToast.error(t.chat?.renameError || 'Failed to rename session');
    }
  };

  const handleUpdateChatAccess = async (sessionId, doctorIds) => {
    try {
      await chatService.updateSessionAccess(sessionId, doctorIds);
      showToast.success(t.chat?.accessUpdated || 'Chat access updated successfully');
      
      // Refresh authorized doctors
      const data = await chatService.getAuthorizedDoctors();
      setAuthorizedDoctors(data || []);
    } catch (error) {
      console.error('Failed to update chat access:', error);
      showToast.error(t.chat?.accessUpdateError || 'Failed to update chat access');
    }
  };

  const handleEndSession = async () => {
    try {
      setIsEndingSession(true);
      // TODO: When backend is ready, uncomment this:
      // await chatService.endSession(sessionId);
      showToast.success(t.chat?.sessionEnded || 'Session ended successfully');
      setShowEndSessionModal(false);
      // Give user time to see the message before navigating back
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (error) {
      console.error('Error ending session:', error);
      showToast.error(t.chat?.endSessionError || 'Failed to end session');
    } finally {
      setIsEndingSession(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  return (
    <div className={`min-h-screen bg-background flex flex-col overflow-hidden ${sidebarOpen ? 'lg:pl-80' : 'lg:pl-0'}`}>
      <div className={`fixed top-16 left-0 w-full ${sidebarOpen ? 'lg:left-80 lg:w-[calc(100%-20rem)]' : 'lg:left-0 lg:w-full'} z-40 bg-white shadow-sm border-b border-gray-200`}>
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-textPrimary">{t.chat.textSession}</h1>
              <div className="flex items-center gap-2 mt-1">
                {connectionStatus === 'connected' && (
                  <span className="flex items-center text-xs text-green-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full ml-1 animate-pulse"></span>
                    {t.chat.connected}
                  </span>
                )}
                {connectionStatus === 'connecting' && (
                  <span className="flex items-center text-xs text-yellow-600">
                    <span className="w-2 h-2 bg-yellow-600 rounded-full ml-1 animate-pulse"></span>
                    {t.chat.connecting}
                  </span>
                )}
                {connectionStatus === 'disconnected' && (
                  <button
                    onClick={reconnect}
                    className="flex items-center text-xs text-red-600 hover:text-red-700 transition-colors"
                  >
                    <span className="w-2 h-2 bg-red-600 rounded-full ml-1"></span>
                    {t.chat.disconnected} - {t.chat.clickToReconnect}
                  </button>
                )}
              </div>

            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEndSessionModal(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t.chat?.endSession || 'End Session'}
            </button>
            <button
              onClick={onBack}
              className="text-textSecondary hover:text-textPrimary transition-colors p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (collapsible, animated) */}
        <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 w-80 transform transition-transform duration-300 bg-white dark:bg-[#1F172B] border-r border-gray-200 dark:border-[#3F3651] shadow-lg lg:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="relative h-full">
            <ChatSidebar
              sessions={sessions}
              currentSession={currentSession}
              isLoading={isLoadingHistory}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              onRenameSession={handleRenameSession}
              authorizedDoctors={authorizedDoctors}
              authorizedLoading={loadingAuthorized}
              authorizedError={authorizedError}
              engagements={engagements}
              engagementsLoading={loadingEngagements}
              onUpdateChatAccess={handleUpdateChatAccess}
              onCloseSidebar={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Open toggle when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="fixed left-0 top-1/2 z-60 -translate-y-1/2 bg-white dark:bg-[#1F172B] border border-gray-200 dark:border-[#3F3651] rounded-r-lg p-2 shadow-md lg:block"
          >
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Floating toggle removed - left-edge open toggle and inside-sidebar close remain */}

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col px-4 py-8 w-full ${sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
              <p className="text-sm text-red-800 flex items-center gap-2" dir="rtl">
                <span>⚠️</span>
                <span>{error}</span>
              </p>
            </div>
          )}

        <div
          className={`fixed z-30 bg-white border border-gray-200 shadow-md rounded-lg ${sidebarOpen ? 'lg:left-80 lg:w-[calc(100%-20rem)] left-0 w-full' : 'lg:left-0 lg:w-full left-0 w-full'}`}
          style={{ top: 'calc(4rem + 4rem)', bottom: '4.5rem', right: 0 }}
        >
          <style>{`
            @keyframes rocketFly {
              0% { transform: translateX(0) translateY(0) rotate(0deg) scale(1); opacity: 1; filter: blur(0px); }
              20% { transform: translateX(14px) translateY(-6px) rotate(6deg) scale(1.04); opacity: 0.98; filter: blur(0.4px); }
              45% { transform: translateX(42px) translateY(-18px) rotate(14deg) scale(1.08); opacity: 0.82; filter: blur(1px); }
              70% { transform: translateX(26px) translateY(-8px) rotate(8deg) scale(1.03); opacity: 0.95; filter: blur(0.6px); }
              100% { transform: translateX(0) translateY(0) rotate(0deg) scale(1); opacity: 1; filter: blur(0px); }
            }

            .send-button { position: relative; overflow: visible; }
            .send-button [data-role="send-arrow"] { transition: transform 120ms ease-out, opacity 120ms; will-change: transform, opacity; }
            .send-button:hover [data-role="send-arrow"] { animation: rocketFly 820ms cubic-bezier(.22,.9,.32,1); }
            .send-button:active [data-role="send-arrow"] { transform: translateX(2px) scale(0.98); }

            /* Rocket trail */
            .send-button::after {
              content: '';
              position: absolute;
              right: 10px;
              top: 50%;
              transform: translateY(-50%);
              width: 8px;
              height: 8px;
              background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.2));
              border-radius: 50%;
              opacity: 0;
              filter: blur(6px);
              pointer-events: none;
            }
            .send-button:hover::after { animation: trail 820ms cubic-bezier(.22,.9,.32,1); }
            @keyframes trail {
              0% { opacity: 0; transform: translateX(0) translateY(-50%) scale(0.6); }
              30% { opacity: 0.8; transform: translateX(18px) translateY(-58%) scale(0.9); }
              55% { opacity: 0.6; transform: translateX(36px) translateY(-68%) scale(1); }
              85% { opacity: 0.2; transform: translateX(22px) translateY(-54%) scale(0.8); }
              100% { opacity: 0; transform: translateX(0) translateY(-50%) scale(0.6); }
            }
          `}</style>
          <div className="h-full flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white pb-32">
              {messages.length === 0 && !isLoadingMessages && (
                <div className="flex justify-start animate-fade-in">
                  <div className="max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg bg-gray-100 text-textPrimary rounded-bl-none">
                    <p className="text-base leading-relaxed" dir="rtl">{t.chat.welcomeMessage}</p>
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : message.type === 'error'
                        ? 'bg-red-100 text-red-800 rounded-bl-none'
                        : 'bg-gray-100 text-textPrimary rounded-bl-none'
                    }`}
                  >
                    <p className="text-base whitespace-pre-wrap leading-relaxed" dir="rtl">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300/50">
                        <p className="text-xs font-semibold mb-2" dir="rtl">المصادر:</p>
                        <ul className="text-xs space-y-1" dir="rtl">
                          {message.sources.map((source, idx) => (
                            <li key={idx} className="truncate flex items-center gap-1">
                              <span>📄</span>
                              <span>{source}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-white/70' : 'text-textSecondary'}`}>
                      {message.timestamp ? new Date(message.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-textPrimary px-4 py-3 rounded-lg rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-textSecondary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-textSecondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-textSecondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Fixed input bar */}
        <div className={`fixed bottom-0 left-0 w-full ${sidebarOpen ? 'lg:left-80 lg:w-[calc(100%-20rem)]' : 'lg:left-0 lg:w-full'} bg-white border-t border-gray-200 shadow-md p-4 z-50`}>
          <div className="w-full px-4">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  // Send on Enter, allow newline with Shift+Enter
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={t.chat.typeYourMessage}
                dir="rtl"
                rows={2}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!isConnected || isAiTyping}
                aria-label={t.chat.send}
                className="bg-gradient-to-r from-primary to-purple-600 text-white px-3 py-2 rounded-md shadow-md transform transition duration-200 ease-out hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 send-button"
              >
                {isAiTyping ? (
                  <>
                    <span>{t.chat.aiIsTyping}</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-sm">{t.chat.send}</span>
                    <svg className="w-4 h-4 transform transition-transform duration-200" data-role="send-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      <Modal
        isOpen={showEndSessionModal}
        onClose={() => setShowEndSessionModal(false)}
        title={t.chat?.endSession || 'End Session'}
        size="small"
      >
        <div className="space-y-4">
          <p className="text-textSecondary">
            {t.chat?.endSessionConfirm || 'Are you sure you want to end this therapy session? Your conversation will be saved in your history.'}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowEndSessionModal(false)}
              disabled={isEndingSession}
            >
              {t.common?.cancel || 'Cancel'}
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleEndSession}
              loading={isEndingSession}
            >
              {t.chat?.endSession || 'End Session'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Sound Session Component
const SoundSession = ({ onBack, sidebarOpen, setSidebarOpen }) => {
  const { t } = useLanguage();
  const messagesEndRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [sessionMessages, setSessionMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: t.chat.welcomeMessage,
      timestamp: new Date(),
    },
  ]);

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      setTranscript("أشعر ببعض الضغط في العمل مؤخراً.");
      setIsRecording(false);
    }, 2000);
  };

  const handleSubmitTranscript = () => {
    if (!transcript.trim()) return;

    const userMessage = {
      id: sessionMessages.length + 1,
      type: 'user',
      content: transcript,
      timestamp: new Date(),
    };

    setSessionMessages([...sessionMessages, userMessage]);
    setTranscript('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: sessionMessages.length + 2,
        type: 'bot',
        content: "ضغط العمل يمكن أن يكون صعباً حقاً. أخبرني المزيد عن ما يجعلك تشعر بالإرهاق.",
        timestamp: new Date(),
      };
      setSessionMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleEndSession = async () => {
    try {
      setIsEndingSession(true);
      // TODO: When backend is ready, uncomment this:
      // await chatService.endSession(sessionId);
      showToast.success(t.chat?.sessionEnded || 'Session ended successfully');
      setShowEndSessionModal(false);
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (error) {
      console.error('Error ending session:', error);
      showToast.error(t.chat?.endSessionError || 'Failed to end session');
    } finally {
      setIsEndingSession(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionMessages]);

  // Prevent page-level scrollbar while in sound session
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow || '';
      document.body.style.overflow = prevBodyOverflow || '';
    };
  }, []);

  return (
    <div className={`min-h-screen bg-background flex flex-col overflow-hidden ${sidebarOpen ? 'lg:pl-80' : 'lg:pl-0'}`}>
      <div className={`fixed top-16 left-0 w-full ${sidebarOpen ? 'lg:left-80 lg:w-[calc(100%-20rem)]' : 'lg:left-0 lg:w-full'} z-40 bg-white shadow-sm border-b border-gray-200`}>
        <div className="px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-textPrimary">{t.chat.soundSession}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              className="text-textSecondary hover:text-textPrimary transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowEndSessionModal(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t.chat?.endSession || 'End Session'}
            </button>
            <button
              onClick={onBack}
              className="text-textSecondary hover:text-textPrimary transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 pt-8 pb-32 max-w-2xl mt-20 flex flex-col">
        {/* Conversation Display */}
        <div className="bg-white rounded-lg shadow-md overflow-y-auto p-6 space-y-4 mb-6 flex-1">
          {sessionMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-secondary text-white rounded-br-none'
                    : 'bg-gray-100 text-textPrimary rounded-bl-none'
                }`}
              >
                <p className="text-base" dir="rtl">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fixed recording controls */}
        <div className={`fixed bottom-0 left-0 w-full ${sidebarOpen ? 'lg:left-80 lg:w-[calc(100%-20rem)]' : 'lg:left-0 lg:w-full'} bg-white border-t border-gray-200 shadow-md p-4 z-50`}>
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-2">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 ${
                isRecording ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <svg className={`w-10 h-10 ${isRecording ? 'text-red-600' : 'text-textSecondary'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
                  <path d="M5.5 9.643a.75.75 0 00-1.5 0V12a5 5 0 0010 0v-2.357a.75.75 0 00-1.5 0V12a3.5 3.5 0 01-7 0V9.643z" />
                </svg>
              </div>
              <p className={`text-sm font-medium ${isRecording ? 'text-red-600' : 'text-textSecondary'}`}>
                {isRecording ? t.chat.recording : transcript ? t.chat.readyToSend : t.chat.clickToSpeak}
              </p>
            </div>

            {transcript && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                <p className="text-sm text-blue-900 font-medium mb-2">{t.chat.yourMessage}:</p>
                <p className="text-sm text-blue-800" dir="rtl">{transcript}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleStartRecording}
                disabled={isRecording}
                className="flex-1 bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 font-medium"
              >
                {isRecording ? t.chat.recording : t.chat.startRecording}
              </button>
              {transcript && (
                <button
                  onClick={handleSubmitTranscript}
                  aria-label={t.chat.send}
                  className="flex-1 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg shadow-md transform transition duration-200 ease-out hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none disabled:opacity-50 font-medium flex items-center justify-center gap-2 send-button"
                >
                    <span className="text-sm">{t.chat.send}</span>
                    <svg className="w-4 h-4 transform transition-transform duration-200" data-role="send-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-24">
          <p className="text-xs text-amber-800">
            <strong>{t.chat.note}:</strong> {t.chat.voiceRecognitionNote}
          </p>
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      <Modal
        isOpen={showEndSessionModal}
        onClose={() => setShowEndSessionModal(false)}
        title={t.chat?.endSession || 'End Session'}
        size="small"
      >
        <div className="space-y-4">
          <p className="text-textSecondary">
            {t.chat?.endSessionConfirm || 'Are you sure you want to end this therapy session? Your conversation will be saved in your history.'}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowEndSessionModal(false)}
              disabled={isEndingSession}
            >
              {t.common?.cancel || 'Cancel'}
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleEndSession}
              loading={isEndingSession}
            >
              {t.chat?.endSession || 'End Session'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Chat;
