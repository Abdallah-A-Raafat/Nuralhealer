/**
 * Voice Chat Screen (React Native with Expo Audio)
 * Audio-based patient-AI interaction with transcription and TTS
 * 
 * Dependencies:
 * - expo-av: Audio recording and playback
 * - expo-file-system: File reading for base64 conversion
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useThemeStore } from '../../store/themeStore';
import { chatService } from '../../services/chatService';

interface VoiceRecord {
  id: string;
  userText: string;
  aiResponse: string;
  audioUrl?: string;
  timestamp: string;
  duration?: number;
}

interface VoiceChatScreenProps {
  sessionId?: string;
  onBack: () => void;
  onSelectSession?: (sessionId: string) => void;
}

/**
 * Voice Chat Session Component
 * Allows users to communicate with AI via voice recording
 */
const VoiceChatScreen: React.FC<VoiceChatScreenProps> = ({
  sessionId: providedSessionId,
  onBack,
  onSelectSession,
}) => {
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  // State management
  const [sessionId, setSessionId] = useState<string | null>(providedSessionId || null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceRecords, setVoiceRecords] = useState<VoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingId, setIsPlayingId] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState('');

  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Request microphone permissions and set audio mode
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpiece: false,
        });
        console.log('✅ Audio permissions granted and mode set');
      } catch (err) {
        console.error('❌ Audio setup error:', err);
        setError(t('chat.audioPermissionRequired') || 'Microphone permission required');
      }
    };

    setupAudio();

    return () => {
      // Cleanup
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Initialize session if not provided
  useEffect(() => {
    if (!sessionId && !providedSessionId) {
      initializeSession();
    }
  }, []);

  /**
   * Initialize a new voice session
   */
  const initializeSession = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.startVoiceSession();
      setSessionId(response.sessionId);
      console.log('📞 Voice session started:', response.sessionId);
    } catch (err) {
      setError(t('chat.failedToStartVoiceSession') || 'Failed to start voice session');
      console.error('Session init error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Start recording audio
   */
  const startRecording = async () => {
    if (isRecording) return;

    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingTime(0);
      setRecognizedText('');
      setError(null);

      // Timer for recording duration
      recordingTimer.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 300) {
            // 5 minute max
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      console.log('🎤 Recording started');
    } catch (err) {
      setError(t('chat.failedToStartRecording') || 'Failed to start recording');
      console.error('Recording error:', err);
    }
  };

  /**
   * Stop recording and send to AI
   */
  const stopRecording = async () => {
    if (!isRecording || !recordingRef.current) return;

    try {
      setIsRecording(false);

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      console.log('⏹️ Recording stopped:', uri);

      if (uri && sessionId) {
        await sendVoiceMessage(uri);
      } else {
        setError(t('chat.noActiveSession') || 'No active session');
      }
    } catch (err) {
      setError(t('chat.failedToStopRecording') || 'Failed to stop recording');
      console.error('Stop recording error:', err);
    }
  };

  /**
   * Send voice message to AI
   */
  const sendVoiceMessage = async (audioUri: string) => {
    if (!sessionId) {
      setError(t('chat.noActiveSession') || 'No active session');
      return;
    }

    try {
      setIsProcessing(true);

      // Read file as base64
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to Blob
      const audioBlob = new Blob([Buffer.from(base64Audio, 'base64')], {
        type: 'audio/m4a',
      });

      // Build conversation history for context
      const conversationHistory: Array<[string, string]> = voiceRecords.map(
        (record) => ['human', record.userText] as [string, string]
      );
      conversationHistory.push(['ai', '']);

      // Send to AI voice endpoint
      const result = await chatService.sendVoiceMessage(
        sessionId,
        audioBlob,
        conversationHistory
      );

      // Add to records
      const newRecord: VoiceRecord = {
        id: `${Date.now()}`,
        userText: recognizedText || result.userText || 'Voice message sent',
        aiResponse: result.answer || 'No response',
        timestamp: new Date().toISOString(),
        audioUrl: result.audioBase64,
      };

      setVoiceRecords((prev) => [...prev, newRecord]);
      setRecognizedText('');

      // Play AI response if available
      if (result.audioBase64) {
        playAudioResponse(result.audioBase64);
      }
    } catch (err) {
      setError(t('chat.failedToSendVoiceMessage') || 'Failed to send voice message');
      console.error('Send voice error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Play audio response from AI (base64)
   */
  const playAudioResponse = async (base64Audio: string) => {
    try {
      setIsPlayingId('ai-response');

      // Convert base64 to file
      const filename = `${FileSystem.documentDirectory}ai_response_${Date.now()}.m4a`;
      await FileSystem.writeAsStringAsync(filename, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Load and play audio
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri: filename });
      soundRef.current = sound;

      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingId(null);
          await sound.unloadAsync();
        }
      });
    } catch (err) {
      console.error('Playback error:', err);
      setIsPlayingId(null);
    }
  };

  /**
   * Play a voice record by ID
   */
  const playVoiceRecord = async (recordId: string) => {
    try {
      const record = voiceRecords.find((r) => r.id === recordId);
      if (!record?.audioUrl) return;

      setIsPlayingId(recordId);

      // Convert base64 to file
      const filename = `${FileSystem.documentDirectory}voice_record_${recordId}.m4a`;
      await FileSystem.writeAsStringAsync(filename, record.audioUrl, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Load and play audio
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri: filename });
      soundRef.current = sound;

      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingId(null);
          await sound.unloadAsync();
        }
      });
    } catch (err) {
      console.error('Playback error:', err);
      setIsPlayingId(null);
    }
  };

  /**
   * Format recording time HH:MM:SS
   */
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  };

  /**
   * Render a voice record item
   */
  const renderVoiceRecord = ({ item }: { item: VoiceRecord }) => (
    <View
      style={[
        styles.recordItem,
        {
          backgroundColor: theme.colors.inputBackground,
          borderColor: theme.colors.inputBorder,
        },
      ]}
    >
      <View style={styles.recordTimestamp}>
        <Text style={[styles.recordTime, { color: theme.colors.textSecondary }]}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {/* User text */}
      <View style={styles.recordSection}>
        <View
          style={[
            styles.recordBubble,
            { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary },
          ]}
        >
          <Text style={[styles.recordLabel, { color: theme.colors.primary }]}>You said:</Text>
          <Text style={[styles.recordText, { color: theme.colors.text, textAlign: 'right', writingDirection: 'rtl' }]}>
            {item.userText}
          </Text>
        </View>
      </View>

      {/* AI response with play button */}
      <View style={styles.recordSection}>
        <View
          style={[
            styles.recordBubble,
            { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder },
          ]}
        >
          <View style={styles.responseHeader}>
            <Text style={[styles.recordLabel, { color: theme.colors.textSecondary }]}>AI said:</Text>
            {item.audioUrl && (
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => playVoiceRecord(item.id)}
                disabled={isPlayingId === item.id}
              >
                <MaterialIcons
                  name={isPlayingId === item.id ? 'pause' : 'play-arrow'}
                  size={16}
                  color="#fff"
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.recordText, { color: theme.colors.text, textAlign: 'right', writingDirection: 'rtl' }]}>
            {item.aiResponse}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.centerText, { color: theme.colors.textSecondary }]}>
            {t('chat.initializingVoiceSession')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.inputBorder }]}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={styles.headerIconText}>🎤</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {t('chat.voiceSession')}
            </Text>
            <Text style={[styles.sessionId, { color: theme.colors.textSecondary }]}>
              ID: {sessionId?.substring(0, 8)}...
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onBack} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name="alert-circle" size={18} color="#DC2626" />
          <Text style={[styles.errorText, { color: '#DC2626' }]}>{error}</Text>
        </View>
      )}

      {/* Recording Area */}
      <View
        style={[
          styles.recordingArea,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.inputBorder,
          },
        ]}
      >
        <View style={styles.recordingContent}>
          {isRecording && (
            <>
              <View style={styles.pulsingDot} />
              <Text style={[styles.recordingLabel, { color: theme.colors.text }]}>
                {t('chat.recording')}
              </Text>
              <Text style={[styles.recordingTime, { color: theme.colors.primary }]}>
                {formatTime(recordingTime)}
              </Text>
            </>
          )}

          {!isRecording && (
            <>
              <Ionicons
                name="mic"
                size={48}
                color={theme.colors.primary}
                style={styles.recordingIcon}
              />
              <Text style={[styles.recordingLabel, { color: theme.colors.text }]}>
                {t('chat.readyToRecord')}
              </Text>
              {recognizedText && (
                <Text style={[styles.recognizedText, { color: theme.colors.textSecondary, textAlign: 'right', writingDirection: 'rtl' }]}>
                  "{recognizedText}"
                </Text>
              )}
            </>
          )}
        </View>

        {/* Recording Controls */}
        <View style={styles.recordingControls}>
          {!isRecording ? (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={startRecording}
              disabled={isProcessing}
            >
              <MaterialIcons name="mic" size={24} color="#fff" />
              <Text style={styles.buttonText}>{t('chat.startRecording')}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#EF4444' }]}
                onPress={stopRecording}
                disabled={isProcessing}
              >
                <MaterialIcons name="stop" size={24} color="#fff" />
                <Text style={styles.buttonText}>{t('chat.stopRecording')}</Text>
              </TouchableOpacity>
            </>
          )}

          {isProcessing && <ActivityIndicator color={theme.colors.primary} size="large" />}
        </View>
      </View>

      {/* Recognized Text */}
      {recognizedText && !isRecording && (
        <View
          style={[
            styles.recognitionBox,
            { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder },
          ]}
        >
          <Text style={[styles.recognitionLabel, { color: theme.colors.textSecondary }]}>
            {t('chat.recognized')}:
          </Text>
          <Text style={[styles.recognitionText, { color: theme.colors.text, textAlign: 'right', writingDirection: 'rtl' }]}>{recognizedText}</Text>
        </View>
      )}

      {/* Voice Records History */}
      <FlatList
        data={voiceRecords}
        renderItem={renderVoiceRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.recordsList}
        ListHeaderComponent={
          voiceRecords.length > 0 ? (
            <Text
              style={[styles.historyTitle, { color: theme.colors.text, marginBottom: 12 }]}
            >
              {t('chat.conversationHistory')}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          !isRecording ? (
            <View style={styles.emptyState}>
              <Ionicons name="mic-off" size={48} color={theme.colors.textSecondary + '80'} />
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                {t('chat.noVoiceRecords')}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  centerText: {
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sessionId: {
    fontSize: 11,
  },
  closeButton: {
    padding: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  recordingArea: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
  },
  recordingContent: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    minHeight: 120,
    justifyContent: 'center',
  },
  pulsingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    marginBottom: 8,
  },
  recordingIcon: {
    marginBottom: 8,
  },
  recordingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  recordingTime: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  recognizedText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
    maxWidth: '90%',
  },
  recordingControls: {
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recognitionBox: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  recognitionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  recognitionText: {
    fontSize: 14,
  },
  recordsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  recordItem: {
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  recordTimestamp: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  recordTime: {
    fontSize: 11,
  },
  recordSection: {
    marginVertical: 4,
  },
  recordBubble: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  recordLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  recordText: {
    fontSize: 13,
    lineHeight: 18,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
  },
});

export default VoiceChatScreen;
