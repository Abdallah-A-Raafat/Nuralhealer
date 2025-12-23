import { useState, useEffect, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { chatService } from '../services/chatService';
import { handleApiError } from '../utils/errorHandler';

export const useVoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const {
    messages,
    isRecording,
    isLoading,
    sessionId,
    addMessage,
    setRecording,
    setLoading,
    startSession,
    setEmotion,
  } = useChatStore();

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const speechSynthesis = window.speechSynthesis;

      if (SpeechRecognition && speechSynthesis) {
        setIsSupported(true);
        
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US'; // You can make this dynamic for Arabic support
        
        setRecognition(recognitionInstance);
        setSynthesis(speechSynthesis);
      } else {
        setIsSupported(false);
        console.warn('Speech recognition not supported in this browser');
      }
    }
  }, []);

  const startNewSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatService.startSession();
      startSession(response.sessionId);
      return response.sessionId;
    } catch (error) {
      console.error('Failed to start session:', handleApiError(error));
      return null;
    } finally {
      setLoading(false);
    }
  }, [startSession, setLoading]);

  const sendTextMessage = useCallback(async (text) => {
    if (!sessionId || !text.trim()) return;

    try {
      setLoading(true);
      
      // Add user message to chat
      addMessage({
        type: 'user',
        content: text,
        messageType: 'text'
      });

      // Send to backend
      const response = await chatService.sendMessage(sessionId, text, 'text');
      
      // Add bot response to chat
      addMessage({
        type: 'bot',
        content: response.message,
        messageType: 'text',
        emotion: response.emotion
      });

      // Update emotion if provided
      if (response.emotion) {
        setEmotion(response.emotion);
      }

      // Speak the response if TTS is available
      if (response.message && synthesis) {
        const utterance = new SpeechSynthesisUtterance(response.message);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        synthesis.speak(utterance);
      }

      return response;
    } catch (error) {
      console.error('Failed to send message:', handleApiError(error));
      addMessage({
        type: 'bot',
        content: 'I apologize, but I encountered an error. Please try again.',
        messageType: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [sessionId, addMessage, setLoading, setEmotion, synthesis]);

  const startListening = useCallback(() => {
    if (!recognition || !isSupported) {
      console.error('Speech recognition not available');
      return;
    }

    setIsListening(true);
    setRecording(true);

    recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice input:', transcript);
      sendTextMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
      setRecording(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setRecording(false);
    };

    recognition.start();
  }, [recognition, isSupported, setRecording, sendTextMessage]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  const speakText = useCallback((text) => {
    if (!synthesis || !text) return;

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // You can set voice based on language preference
    const voices = synthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.includes('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    synthesis.speak(utterance);
  }, [synthesis]);

  const stopSpeaking = useCallback(() => {
    if (synthesis) {
      synthesis.cancel();
    }
  }, [synthesis]);

  return {
    // State
    messages,
    isListening,
    isRecording,
    isLoading,
    isSupported,
    sessionId,

    // Actions
    startNewSession,
    sendTextMessage,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  };
};
