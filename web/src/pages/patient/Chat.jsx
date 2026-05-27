import { useState, useEffect, useRef } from 'react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ChatSidebar from '../../components/chat/ChatSidebar';
import { useAiChat } from '../../hooks/useAiChat';
import { useLanguage } from '../../hooks/useLanguage';
import { chatService } from '../../services/chatService';
import engagementService from '../../services/engagementService';
import { showToast } from '../../utils/toast';

// ─────────────────────────────────────────────────────────────────────────────
// Root component — picks which session type to render
// ─────────────────────────────────────────────────────────────────────────────
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
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-textPrimary mb-4">{t.chat.aiTherapySession}</h1>
          <p className="text-lg text-textSecondary">{t.chat.chooseConnection}</p>
        </div>

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
              <p className="text-textSecondary text-center">{t.chat.textSessionDesc}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <p className="text-sm font-semibold text-textPrimary">{t.chat.features}:</p>
              <ul className="text-sm text-textSecondary space-y-1">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t.chat.realTimeAiResponses}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t.chat.sessionTranscriptSaved}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t.chat.emotionAnalysisIncluded}
                </li>
              </ul>
            </div>
            <Button variant="primary" size="large" className="w-full" onClick={() => setSelectedSession('text')}>
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
              <p className="text-textSecondary text-center">{t.chat.soundSessionDesc}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <p className="text-sm font-semibold text-textPrimary">{t.chat.features}:</p>
              <ul className="text-sm text-textSecondary space-y-1">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t.chat.voiceToTextConversion}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t.chat.naturalConversationFlow}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {t.chat.aiVoiceResponses}
                </li>
              </ul>
            </div>
            <Button variant="secondary" size="large" className="w-full" onClick={() => setSelectedSession('sound')}>
              {t.chat.startSoundSession}
            </Button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 {t.chat.tip}</h3>
          <p className="text-blue-800 text-sm">{t.chat.tipText}</p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Text Session Component
// ─────────────────────────────────────────────────────────────────────────────
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
    sendMessage,
    reconnect,
    loadSession,
    createNewSession,
    fetchSessions,
    renameSession,
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

  // Prevent page-level scrollbar
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml || '';
      document.body.style.overflow = prevBody || '';
    };
  }, []);

  useEffect(() => {
    const load = async () => {
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
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
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
    load();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const sent = await sendMessage(inputValue);
    if (sent) {
      setInputValue('');
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
      await fetchSessions();
    } catch (error) {
      console.error('Failed to rename session:', error);
      showToast.error(t.chat?.renameError || 'Failed to rename session');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await chatService.deleteSession(sessionId);
      showToast.success(t.chat?.sessionDeleted || 'Session deleted');
      if (currentSession === sessionId) {
        createNewSession();
      }
      await fetchSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
      showToast.error(t.chat?.deleteError || 'Failed to delete session');
    }
  };

  const handleUpdateChatAccess = async (sessionId, doctorIds) => {
    try {
      await chatService.updateSessionAccess(sessionId, doctorIds);
      showToast.success(t.chat?.accessUpdated || 'Chat access updated successfully');
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
      showToast.success(t.chat?.sessionEnded || 'Session ended successfully');
      setShowEndSessionModal(false);
      setTimeout(() => onBack(), 1000);
    } catch (error) {
      console.error('Error ending session:', error);
      showToast.error(t.chat?.endSessionError || 'Failed to end session');
    } finally {
      setIsEndingSession(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-background flex flex-col overflow-hidden ${sidebarOpen ? 'lg:pl-80' : 'lg:pl-0'}`}>
      {/* Top bar */}
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
                  <button onClick={reconnect} className="flex items-center text-xs text-red-600 hover:text-red-700 transition-colors">
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              {t.chat?.endSession || 'End Session'}
            </button>
            <button onClick={onBack} className="text-textSecondary hover:text-textPrimary transition-colors p-2 hover:bg-gray-100 rounded-lg" aria-label="Back">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 w-80 transform transition-transform duration-300 bg-white dark:bg-[#1F172B] border-r border-gray-200 dark:border-[#3F3651] shadow-lg lg:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="relative h-full">
            <ChatSidebar
              sessions={sessions}
              currentSession={currentSession}
              isLoading={isLoadingHistory}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              onRenameSession={handleRenameSession}
              onDeleteSession={handleDeleteSession}
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
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        )}

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col px-4 py-8 w-full ${sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
              <p className="text-sm text-red-800 flex items-center gap-2" dir="rtl">
                <span>⚠️</span><span>{error}</span>
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
              .send-button::after { content: ''; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.2)); border-radius: 50%; opacity: 0; filter: blur(6px); pointer-events: none; }
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
                {messages.length === 0 && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg bg-gray-100 text-textPrimary rounded-bl-none">
                      <p className="text-base leading-relaxed" dir="rtl">{t.chat.welcomeMessage}</p>
                    </div>
                  </div>
                )}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                      message.type === 'user' ? 'bg-primary text-white rounded-br-none'
                      : message.type === 'error' ? 'bg-red-100 text-red-800 rounded-bl-none'
                      : 'bg-gray-100 text-textPrimary rounded-bl-none'
                    }`}>
                      <p className="text-base whitespace-pre-wrap leading-relaxed" dir="rtl">{message.content}</p>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300/50">
                          <p className="text-xs font-semibold mb-2" dir="rtl">المصادر:</p>
                          <ul className="text-xs space-y-1" dir="rtl">
                            {message.sources.map((source, idx) => (
                              <li key={idx} className="truncate flex items-center gap-1"><span>📄</span><span>{source}</span></li>
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

      {/* End Session Modal */}
      <Modal isOpen={showEndSessionModal} onClose={() => setShowEndSessionModal(false)} title={t.chat?.endSession || 'End Session'} size="small">
        <div className="space-y-4">
          <p className="text-textSecondary">{t.chat?.endSessionConfirm || 'Are you sure you want to end this therapy session?'}</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowEndSessionModal(false)} disabled={isEndingSession}>
              {t.common?.cancel || 'Cancel'}
            </Button>
            <Button variant="primary" className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleEndSession} loading={isEndingSession}>
              {t.chat?.endSession || 'End Session'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sound Session Component
// ─────────────────────────────────────────────────────────────────────────────
const SoundSession = ({ onBack, sidebarOpen, setSidebarOpen }) => {
  const { t } = useLanguage();

  // state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState(0);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [sessionRecords, setSessionRecords] = useState([]);
  const [voiceSessionId, setVoiceSessionId] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioPlayingId, setAudioPlayingId] = useState(null);
  const [failedRecordId, setFailedRecordId] = useState(null);
  const [processingState, setProcessingState] = useState('idle');
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // refs
  const mediaRecorderRef = useRef(null);
  const audioPlaybackRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);

  // ── session init ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const createVoiceSession = async () => {
      try {
        const response = await chatService.startVoiceSession();
        const sessionId = response?.sessionId || response?.id || response;
        if (!cancelled) {
          setVoiceSessionId(sessionId);
          setCurrentSessionId(sessionId);
          loadSessions();
        }
      } catch (error) {
        console.error('Failed to create voice session:', error);
        if (!cancelled) showToast.error(t.chat?.sessionStartError || 'Failed to start voice session');
      }
    };

    createVoiceSession();

    return () => {
      cancelled = true;
      if (recordingTimeoutRef.current) { clearTimeout(recordingTimeoutRef.current); recordingTimeoutRef.current = null; }
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} recognitionRef.current = null; }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') { try { mediaRecorderRef.current.stop(); } catch {} }
      if (audioStreamRef.current) { audioStreamRef.current.getTracks().forEach((t) => t.stop()); audioStreamRef.current = null; }
    };
  }, [t.chat?.sessionStartError]);

  // ── timers ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setSessionDurationSeconds((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setRecordingSeconds((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // ── prevent page scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml || '';
      document.body.style.overflow = prevBody || '';
    };
  }, []);

  // ── load sessions on mount ──────────────────────────────────────────────────
  useEffect(() => {
    loadSessions();
  }, []);

  // ── helpers ─────────────────────────────────────────────────────────────────
  const formatDuration = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── sidebar helpers ─────────────────────────────────────────────────────────
  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const data = await chatService.getSessionHistory();
      const normalized = Array.isArray(data) ? data : data?.content || [];
      setSessions(normalized);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleSelectSession = async (sessionId) => {
    if (sessionId === currentSessionId) return;
    try {
      const messages = await chatService.getSessionDetails(sessionId);
      const records = [];
      for (let i = 0; i < messages.length - 1; i++) {
        const msg = messages[i];
        const next = messages[i + 1];
        if (msg.senderType === 'patient' && next?.senderType === 'ai') {
          records.push({
            id: msg.id,
            userTranscript: msg.content,
            aiSummary: next.content,
            audioBase64: null,
            timestamp: new Date(msg.sentAt),
          });
          i++;
        }
      }
      setSessionRecords(records.reverse());
      setVoiceSessionId(sessionId);
      setCurrentSessionId(sessionId);
    } catch (err) {
      console.error('Failed to load session:', err);
      showToast.error('Failed to load session');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await chatService.deleteSession(sessionId);
      showToast.success('Session deleted');
      if (currentSessionId === sessionId) {
        setSessionRecords([]);
        setVoiceSessionId(null);
        setCurrentSessionId(null);
      }
      loadSessions();
    } catch (err) {
      showToast.error('Failed to delete session');
    }
  };

  // ── recording ───────────────────────────────────────────────────────────────
  const stopRecording = () => {
    if (recordingTimeoutRef.current) { clearTimeout(recordingTimeoutRef.current); recordingTimeoutRef.current = null; }
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} recognitionRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setIsRecording(false);
    }
  };

  const playAudio = (audioBase64, recordId) => {
    if (!audioBase64) { showToast.error(t.chat?.noAudioToPlay || 'No audio to play'); return; }
    try {
      if (audioPlaybackRef.current) { audioPlaybackRef.current.pause(); audioPlaybackRef.current = null; }
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.onended = () => { setAudioPlayingId(null); audioPlaybackRef.current = null; };
      audio.onerror = () => { showToast.error(t.chat?.audioPlaybackError || 'Failed to play audio'); setAudioPlayingId(null); audioPlaybackRef.current = null; };
      setAudioPlayingId(recordId);
      audioPlaybackRef.current = audio;
      audio.play();
    } catch (error) {
      console.error('Error decoding audio:', error);
      showToast.error(t.chat?.audioDecodeError || 'Failed to decode audio');
      setAudioPlayingId(null);
    }
  };

  const handleStartRecording = async () => {
    if (isRecording || isProcessingTranscript) return;
    if (!voiceSessionId) { showToast.error(t.chat?.sessionStartError || 'Voice session is not ready yet'); return; }
    try {
      setRecordingSeconds(0);
      setTranscript('');
      setRecordedAudio(null);
      setProcessingState('recording');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const chunks = [];
      audioChunksRef.current = chunks;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        setRecordedAudio(new Blob(chunks, { type: mimeType }));
        setIsRecording(false);
        setProcessingState('idle');
        if (audioStreamRef.current) { audioStreamRef.current.getTracks().forEach((t) => t.stop()); audioStreamRef.current = null; }
        mediaRecorderRef.current = null;
      };

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-EG';
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.onresult = (e) => { const t = e.results?.[0]?.[0]?.transcript || ''; if (t) setTranscript(t); };
        recognition.onerror = (e) => console.warn('Speech recognition error:', e.error);
        recognitionRef.current = recognition;
        recognition.start();
      }

      recorder.start();
      setIsRecording(true);
      setProcessingState('recording');
    } catch (error) {
      console.error('Failed to start voice recording:', error);
      showToast.error(t.chat?.microphoneError || 'Unable to access microphone');
      setIsRecording(false);
    }
  };

  const handleSubmitTranscript = async (recordIdToRetry = null) => {
    if (isProcessingTranscript) return;
    if (!voiceSessionId) { showToast.error(t.chat?.sessionStartError || 'Voice session is not ready yet'); return; }
    if (!recordIdToRetry && !transcript.trim() && !recordedAudio) return;

    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = async () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioStreamRef.current) { audioStreamRef.current.getTracks().forEach((t) => t.stop()); audioStreamRef.current = null; }
        setIsRecording(false);
        setProcessingState('idle');
        await submitVoice(audioBlob, transcript);
      };
      mediaRecorderRef.current.stop();
      return;
    }

    await submitVoice(recordedAudio, transcript);
  };

  const submitVoice = async (audioBlob, currentTranscript) => {
    try {
      setIsProcessingTranscript(true);
      setProcessingState('processing');

      const conversationHistory = sessionRecords
        .slice()
        .reverse()
        .flatMap((r) => [['human', r.userTranscript], ['ai', r.aiSummary]]);

      const response = audioBlob
        ? await chatService.sendVoiceMessage(voiceSessionId, audioBlob, conversationHistory)
        : await chatService.sendMessage(voiceSessionId, currentTranscript.trim(), 'text');

      setProcessingState('responding');

      const aiSummary = response?.answer || response?.message || 'No response received';
      const userTranscript = currentTranscript.trim() || t.chat?.voiceMessageRecorded || 'Voice message recorded';
      const audioBase64 = response?.audioBase64 || null;

      const newRecord = { id: Date.now(), userTranscript, aiSummary, audioBase64, timestamp: new Date() };
      setSessionRecords((prev) => [newRecord, ...prev]);
      setTranscript('');
      setRecordedAudio(null);
      setFailedRecordId(null);

      if (audioBase64) setTimeout(() => playAudio(audioBase64, newRecord.id), 500);

      // Refresh sidebar to update message count
      setTimeout(() => loadSessions(), 800);
    } catch (error) {
      console.error('Failed to send voice session:', error);
      setFailedRecordId(recordIdToRetry || Date.now());
      showToast.error(t.chat?.sendingRequest || 'Failed to process voice session.');
    } finally {
      setIsProcessingTranscript(false);
      setProcessingState('idle');
    }
  };

  const handleEndSession = async () => {
    try {
      setIsEndingSession(true);
      if (voiceSessionId) await chatService.endSession(voiceSessionId);
      showToast.success(t.chat?.sessionEnded || 'Session ended successfully');
      setShowEndSessionModal(false);
      setTimeout(() => onBack(), 1000);
    } catch (error) {
      console.error('Error ending session:', error);
      showToast.error(t.chat?.endSessionError || 'Failed to end session');
    } finally {
      setIsEndingSession(false);
    }
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 w-80 transform transition-transform duration-300 bg-white dark:bg-[#1F172B] border-r border-gray-200 dark:border-[#3F3651] shadow-lg ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <ChatSidebar
          sessions={sessions}
          currentSession={currentSessionId}
          isLoading={isLoadingSessions}
          onSelectSession={handleSelectSession}
          onNewChat={async () => {
            try {
              const response = await chatService.startVoiceSession();
              const sessionId = response?.sessionId || response?.id || response;
              setVoiceSessionId(sessionId);
              setCurrentSessionId(sessionId);
              setSessionRecords([]);
              loadSessions();
            } catch (err) {
              showToast.error('Failed to start new voice session');
            }
          }}
          onDeleteSession={handleDeleteSession}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      </div>

      {/* Open toggle when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          className="fixed left-0 top-1/2 z-50 -translate-y-1/2 bg-white dark:bg-[#1F172B] border border-gray-200 dark:border-[#3F3651] rounded-r-lg p-2 shadow-md"
        >
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      )}

      {/* Main content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'lg:ml-80' : ''}`}>
        {/* Top bar */}
        <div className="fixed top-16 right-0 left-0 z-40 bg-white shadow-sm border-b border-gray-200" style={{ left: sidebarOpen ? '20rem' : 0 }}>
          <div className="px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-textPrimary">{t.chat.soundSession}</h1>
              <p className="text-xs text-textSecondary mt-1">
                {t.chat?.sessionTimeLabel || 'Session time'}: {formatDuration(sessionDurationSeconds)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
                className="text-textSecondary hover:text-textPrimary transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
              <button
                onClick={() => setShowEndSessionModal(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                {t.chat?.endSession || 'End Session'}
              </button>
              <button onClick={onBack} className="text-textSecondary hover:text-textPrimary transition-colors p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-10 max-w-4xl mx-auto w-full mt-32">
          <div className="grid gap-6">
            {/* Recording card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-100 ring-8 ring-red-50' : 'bg-gray-100'}`}>
                    <svg className={`w-8 h-8 ${isRecording ? 'text-red-600 animate-pulse' : 'text-textSecondary'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
                      <path d="M5.5 9.643a.75.75 0 00-1.5 0V12a5 5 0 0010 0v-2.357a.75.75 0 00-1.5 0V12a3.5 3.5 0 01-7 0V9.643z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-textPrimary">{t.chat?.liveVoiceSession || 'Live voice session'}</h2>
                    <p className={`text-sm ${isRecording ? 'text-red-600 font-medium' : 'text-textSecondary'}`}>
                      {isRecording ? `${t.chat.recording} • ${formatDuration(recordingSeconds)}` : transcript ? t.chat.readyToSend : t.chat.clickToSpeak}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 16 }).map((_, index) => (
                    <span
                      key={index}
                      className={`w-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}
                      style={{ height: `${isRecording ? 10 + ((index * 7) % 24) : 10}px`, animationDelay: `${index * 0.06}s` }}
                    />
                  ))}
                </div>
              </div>

              {transcript && (
                <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-900">{t.chat.yourMessage}</p>
                    {processingState !== 'idle' && (
                      <span className="text-xs text-blue-700 font-medium">
                        {processingState === 'recording' && '🔴 Recording...'}
                        {processingState === 'processing' && '⏳ Processing...'}
                        {processingState === 'responding' && '🤖 AI is responding...'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed" dir="rtl">{transcript}</p>
                </div>
              )}

              {recordedAudio && !transcript && (
                <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">{t.chat.yourMessage}</p>
                  <p className="text-sm text-blue-800 leading-relaxed">{t.chat?.voiceMessageRecorded || 'Voice message captured and ready to send.'}</p>
                </div>
              )}

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={isRecording ? stopRecording : handleStartRecording}
                  disabled={isProcessingTranscript}
                  className="sm:flex-1 bg-secondary text-white px-6 py-3 rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50 font-medium"
                >
                  {isRecording ? '⏹ Stop Recording' : '🎙 Start Recording'}
                </button>
                <button
                  onClick={handleSubmitTranscript}
                  disabled={(!transcript && !recordedAudio) || isProcessingTranscript}
                  aria-label={t.chat.send}
                  className="sm:flex-1 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-xl shadow-md transform transition duration-200 ease-out hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl focus:outline-none disabled:opacity-50 font-medium"
                >
                  {isProcessingTranscript ? (t.chat?.sendingRequest || 'Processing...') : t.chat.send}
                </button>
              </div>
            </div>

            {/* Session records */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-textPrimary">{t.chat?.sessionRecords || 'Session records'}</h3>
                <span className="text-xs text-textSecondary bg-gray-100 px-3 py-1 rounded-full">
                  {sessionRecords.length} {t.chat?.records || 'records'}
                </span>
              </div>

              {sessionRecords.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-sm text-textSecondary">{t.chat?.noRecordsYet || 'No records yet. Start speaking to build your audio session history.'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessionRecords.map((record, index) => (
                    <div key={record.id} className={`rounded-xl border p-4 ${failedRecordId === record.id ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-textPrimary">#{sessionRecords.length - index}</span>
                        <span className="text-xs text-textSecondary">
                          {record.timestamp instanceof Date
                            ? record.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                            : new Date(record.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-textPrimary leading-relaxed mb-2" dir="rtl">{record.userTranscript}</p>
                      <p className="text-sm text-textSecondary leading-relaxed mb-3" dir="rtl">{record.aiSummary}</p>

                      {record.audioBase64 && (
                        <div className="flex items-center gap-2 mb-3">
                          <button
                            onClick={() => playAudio(record.audioBase64, record.id)}
                            disabled={isProcessingTranscript}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              audioPlayingId === record.id ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            } disabled:opacity-50`}
                          >
                            {audioPlayingId === record.id ? (
                              <><svg className="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 20 20"><path d="M5.354 7.146a.5.5 0 000 .708l7 7a.5.5 0 00.708-.708l-7-7a.5.5 0 00-.708 0z"/></svg>{t.chat?.playing || 'Playing...'}</>
                            ) : (
                              <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"/></svg>{t.chat?.playAudio || 'Play audio'}</>
                            )}
                          </button>
                        </div>
                      )}

                      {failedRecordId === record.id && (
                        <div className="flex items-center gap-2 pt-2 border-t border-red-200">
                          <p className="text-xs text-red-600 flex-1">{t.chat?.uploadFailed || 'Upload failed'}</p>
                          <button
                            onClick={() => handleSubmitTranscript(record.id)}
                            disabled={isProcessingTranscript}
                            className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {t.chat?.retry || 'Retry'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-amber-800"><strong>{t.chat.note}:</strong> {t.chat.voiceRecognitionNote}</p>
            </div>
          </div>
        </div>
      </div>

      {/* End Session Modal */}
      <Modal isOpen={showEndSessionModal} onClose={() => setShowEndSessionModal(false)} title={t.chat?.endSession || 'End Session'} size="small">
        <div className="space-y-4">
          <p className="text-textSecondary">{t.chat?.endSessionConfirm || 'Are you sure you want to end this therapy session?'}</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowEndSessionModal(false)} disabled={isEndingSession}>
              {t.common?.cancel || 'Cancel'}
            </Button>
            <Button variant="primary" className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleEndSession} loading={isEndingSession}>
              {t.chat?.endSession || 'End Session'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Chat;