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
  const { t } = useLanguage();

  if (selectedSession === 'text') {
    return <TextSession onBack={() => setSelectedSession(null)} />;
  }

  if (selectedSession === 'sound') {
    return <SoundSession onBack={() => setSelectedSession(null)} />;
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
const TextSession = ({ onBack }) => {
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
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
        {/* Sidebar */}
        <div className="w-80 hidden lg:block">
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
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col px-4 py-8 max-w-4xl mx-auto w-full">{error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
            <p className="text-sm text-red-800 flex items-center gap-2" dir="rtl">
              <span>⚠️</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md flex-1 overflow-hidden flex flex-col mb-6 border border-gray-200">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-textPrimary flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {t.chat.textSession}
              {isLoadingMessages && (
                <div className="ml-2 flex items-center gap-1 text-xs text-gray-500">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
                  <span>Loading...</span>
                </div>
              )}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">{messages.length === 0 && !isLoadingMessages && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg bg-gray-100 text-textPrimary rounded-bl-none">
                  <p className="text-sm leading-relaxed" dir="rtl">{t.chat.welcomeMessage}</p>
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
                  <p className="text-sm whitespace-pre-wrap leading-relaxed" dir="rtl">{message.content}</p>
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

        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t.chat.typeYourMessage}
              dir="rtl"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!isConnected || isAiTyping}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
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
                  <span>{t.chat.send}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
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
const SoundSession = ({ onBack }) => {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-textPrimary">{t.chat.soundSession}</h1>
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
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Conversation Display */}
        <div className="bg-white rounded-lg shadow-md h-72 overflow-y-auto p-6 space-y-4 mb-6">
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
                <p className="text-sm" dir="rtl">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recording Controls */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                {t.chat.send}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
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
