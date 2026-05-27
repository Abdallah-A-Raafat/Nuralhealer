/**
 * AI Chat Screen
 * Main chat interface for text-based AI therapy sessions
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useAiChat } from '../../hooks/useAiChat';
import { ChatSidebar } from '../../components/chat/ChatSidebar';
import VoiceChatScreen from './VoiceChatScreen';

// Session Type Selection Screen
const SessionTypeSelector: React.FC<{ onSelectSession: (type: string) => void }> = ({ onSelectSession }) => {
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.selectorContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>
            {t('chat.aiTherapySession')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('chat.chooseConnection')}
          </Text>
        </View>

        {/* Session Options */}
        <View style={styles.optionsContainer}>
          {/* Text Session Card */}
          <TouchableOpacity
            style={[styles.sessionCard, { backgroundColor: theme.colors.card }]}
            onPress={() => onSelectSession('text')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={styles.iconEmoji}>💬</Text>
            </View>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {t('chat.textSession')}
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
              {t('chat.textSessionDesc')}
            </Text>
            <View style={[styles.featuresBox, { backgroundColor: theme.colors.inputBackground }]}>
              <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
                {t('chat.features')}:
              </Text>
              <Text style={[styles.featureItem, { color: theme.colors.textSecondary }]}>
                ✓ {t('chat.realTimeAiResponses')}
              </Text>
              <Text style={[styles.featureItem, { color: theme.colors.textSecondary }]}>
                ✓ {t('chat.sessionTranscriptSaved')}
              </Text>
              <Text style={[styles.featureItem, { color: theme.colors.textSecondary }]}>
                ✓ {t('chat.emotionAnalysisIncluded')}
              </Text>
            </View>
            <View style={[styles.startButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.startButtonText}>{t('chat.startTextSession')}</Text>
            </View>
          </TouchableOpacity>

          {/* Voice Session Card */}
          <TouchableOpacity
            style={[styles.sessionCard, { backgroundColor: theme.colors.card }]}
            onPress={() => onSelectSession('voice')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#8E44AD20' }]}>
              <Text style={styles.iconEmoji}>🎤</Text>
            </View>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {t('chat.soundSession')}
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
              {t('chat.soundSessionDesc')}
            </Text>
            <View style={[styles.featuresBox, { backgroundColor: theme.colors.inputBackground }]}>
              <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
                {t('chat.features')}:
              </Text>
              <Text style={[styles.featureItem, { color: theme.colors.textSecondary }]}>
                ✓ {t('chat.voiceToTextConversion')}
              </Text>
              <Text style={[styles.featureItem, { color: theme.colors.textSecondary }]}>
                ✓ {t('chat.naturalConversationFlow')}
              </Text>
              <Text style={[styles.featureItem, { color: theme.colors.textSecondary }]}>
                ✓ {t('chat.aiVoiceResponses')}
              </Text>
            </View>
            <View style={[styles.startButton, { backgroundColor: '#8E44AD' }]}>
              <Text style={styles.startButtonText}>{t('chat.startSoundSession')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tip Box */}
        <View style={[styles.tipBox, { backgroundColor: '#EBF5FF', borderColor: '#3B82F6' }]}>
          <Text style={[styles.tipTitle, { color: '#1E40AF' }]}>💡 {t('chat.tip')}</Text>
          <Text style={[styles.tipText, { color: '#1E3A8A' }]}>{t('chat.tipText')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Text Chat Session Component
const TextChatSession: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const flatListRef = useRef<FlatList>(null);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const {
    messages,
    isConnected,
    isAiTyping,
    connectionStatus,
    error,
    sendMessage,
    reconnect,
    sessions,
    currentSession,
    isLoadingHistory,
    isLoadingMessages,
    fetchSessions,
    loadSession,
    createNewSession,
    deleteSession,
    renameSession,
  } = useAiChat();

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const sent = await sendMessage(inputValue);
    if (sent) {
      setInputValue('');
      // Refresh sessions after sending
      setTimeout(() => {
        fetchSessions();
      }, 500);
    }
  };

  const handleEndSession = () => {
    Alert.alert(
      t('chat.endSession'),
      t('chat.endSessionConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('chat.endSession'), style: 'destructive', onPress: () => onBack() },
      ]
    );
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSelectSession = (sessionId: string) => {
    if (!sessionId) return;
    loadSession(sessionId);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    createNewSession();
    setInputValue('');
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isAiTyping]);

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.type === 'user';
    const isError = item.type === 'error';

    return (
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.botBubble,
        isUser && { backgroundColor: theme.colors.primary },
        !isUser && !isError && { backgroundColor: theme.colors.inputBackground },
        isError && { backgroundColor: '#FEE2E2' },
      ]}>
        <Text style={[
          styles.messageText,
          { textAlign: 'right', writingDirection: 'rtl' },
          isUser && { color: '#FFFFFF' },
          !isUser && !isError && { color: theme.colors.text },
          isError && { color: '#991B1B' },
        ]}>
          {item.content}
        </Text>
        <Text style={[
          styles.timestamp,
          isUser ? { color: 'rgba(255,255,255,0.7)' } : { color: theme.colors.textSecondary },
        ]}>
          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isAiTyping) return null;
    return (
      <View style={[styles.typingIndicator, { backgroundColor: theme.colors.inputBackground }]}>
        <Text style={{ color: theme.colors.textSecondary }}>{t('chat.aiTyping') || 'AI is typing...'}</Text>
      </View>
    );
  };

  const renderWelcomeMessage = () => {
    if (messages.length > 0) return null;
    return (
      <View style={[styles.welcomeBubble, { backgroundColor: theme.colors.inputBackground }]}>
        <Text style={[styles.messageText, { color: theme.colors.text, textAlign: 'right', writingDirection: 'rtl' }]}>
          {t('chat.welcomeMessage')}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.chatHeader, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          onPress={() => setSidebarOpen(true)}
          style={styles.hamburgerButton}
        >
          <MaterialIcons name="menu" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={styles.headerIconText}>💬</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('chat.textSession')}</Text>
            <View style={styles.connectionStatus}>
              {connectionStatus === 'connected' && (
                <>
                  <View style={[styles.statusDot, { backgroundColor: '#22C55E' }]} />
                  <Text style={[styles.statusText, { color: '#22C55E' }]}>{t('chat.connected')}</Text>
                </>
              )}
              {connectionStatus === 'connecting' && (
                <>
                  <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={[styles.statusText, { color: '#F59E0B' }]}>{t('chat.connecting')}</Text>
                </>
              )}
              {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
                <TouchableOpacity onPress={reconnect} style={styles.reconnectButton}>
                  <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={[styles.statusText, { color: '#EF4444' }]}>{t('chat.disconnected')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleEndSession} style={styles.endButton}>
            <Text style={styles.endButtonText}>{t('chat.endSession')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <KeyboardAvoidingView 
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          ListHeaderComponent={renderWelcomeMessage}
          ListFooterComponent={renderTypingIndicator}
          showsVerticalScrollIndicator={false}
          refreshing={isLoadingMessages}
          onRefresh={currentSession ? () => loadSession(currentSession) : undefined}
        />

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={t('chat.typeYourMessage')}
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.textInput, { 
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
              borderColor: theme.colors.inputBorder,
            }]}
            multiline
            maxLength={1000}
            editable={isConnected}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!isConnected || isAiTyping || !inputValue.trim()}
            style={[
              styles.sendButton,
              { backgroundColor: theme.colors.primary },
              (!isConnected || isAiTyping || !inputValue.trim()) && styles.sendButtonDisabled,
            ]}
          >
            {isAiTyping ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>→</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Sidebar Modal */}
      <Modal
        visible={sidebarOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSidebarOpen(false)}
      >
        <ChatSidebar
          sessions={sessions}
          currentSession={currentSession}
          isLoading={isLoadingHistory}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onRenameSession={renameSession}
          onDeleteSession={deleteSession}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};

// Voice Chat Session
const VoiceChatSession: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentSession, createNewSession } = useAiChat();

  useEffect(() => {
    if (!currentSession) {
      createNewSession();
    }
  }, []);

  return (
    <VoiceChatScreen
      sessionId={currentSession || ''}
      onBack={onBack}
    />
  );
};

// Main Chat Screen
const ChatScreen: React.FC = () => {
  const [sessionType, setSessionType] = useState<string | null>(null);

  if (sessionType === 'text') {
    return <TextChatSession onBack={() => setSessionType(null)} />;
  }
  if (sessionType === 'voice') {
    return <VoiceChatSession onBack={() => setSessionType(null)} />;
  }
  return <SessionTypeSelector onSelectSession={setSessionType} />;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  selectorContainer: { padding: 20 },
  headerSection: { alignItems: 'center', marginBottom: 24 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center' },
  optionsContainer: { gap: 16 },
  sessionCard: { borderRadius: 16, padding: 20, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  iconContainer: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 },
  iconEmoji: { fontSize: 28 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  cardDescription: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  featuresBox: { borderRadius: 12, padding: 12, marginBottom: 16 },
  featuresTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  featureItem: { fontSize: 13, marginBottom: 4 },
  startButton: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  startButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  tipBox: { borderRadius: 12, padding: 16, marginTop: 8, borderWidth: 1 },
  tipTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  tipText: { fontSize: 13 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  hamburgerButton: { marginRight: 8, padding: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerIconText: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  connectionStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12 },
  reconnectButton: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  endButton: { paddingHorizontal: 12, paddingVertical: 6 },
  endButtonText: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 20 },
  errorBanner: { backgroundColor: '#FEE2E2', padding: 12, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  errorText: { color: '#991B1B', fontSize: 14 },
  chatArea: { flex: 1 },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  botBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  welcomeBubble: { alignSelf: 'flex-start', padding: 12, borderRadius: 16, borderBottomLeftRadius: 4, marginBottom: 8, maxWidth: '80%' },
  messageText: { fontSize: 15, lineHeight: 22 },
  timestamp: { fontSize: 11, marginTop: 4 },
  typingIndicator: { alignSelf: 'flex-start', padding: 12, borderRadius: 16, borderBottomLeftRadius: 4 },
  inputContainer: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1 },
  textInput: { flex: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, maxHeight: 100, borderWidth: 1 },
  sendButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },
  voiceContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  voiceTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  voiceSubtitle: { fontSize: 16, marginBottom: 24 },
  voiceBackButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  voiceBackButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  sessionsCard: { marginHorizontal: 16, marginTop: 12, padding: 12, borderWidth: 1, borderRadius: 12 },
  sessionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sessionsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionsHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionsTitle: { fontSize: 16, fontWeight: '600' },
  sessionActionButton: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 10 },
  sessionActionText: { fontSize: 13, fontWeight: '500' },
  sessionActionButtonPrimary: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  sessionActionPrimaryText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  sessionsList: { gap: 10, paddingVertical: 4 },
  sessionItem: { width: 180, padding: 12, borderWidth: 1, borderRadius: 12, marginRight: 8 },
  sessionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  sessionMeta: { fontSize: 12, marginBottom: 2 },
  sessionActiveBadge: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  emptySessionsText: { fontSize: 13, textAlign: 'left', paddingVertical: 6 },
});

export default ChatScreen;
