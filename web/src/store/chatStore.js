import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  messages: [],
  currentEmotion: null,
  isRecording: false,
  isLoading: false,
  sessionId: null,
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, {
      id: Date.now(),
      timestamp: new Date(),
      ...message
    }]
  })),
  
  setEmotion: (emotion) => set({ currentEmotion: emotion }),
  
  setRecording: (isRecording) => set({ isRecording }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  startSession: (sessionId) => set({ 
    sessionId, 
    messages: [],
    currentEmotion: null 
  }),
  
  clearChat: () => set({ 
    messages: [], 
    currentEmotion: null, 
    sessionId: null 
  }),
  
  getLastMessage: () => {
    const messages = get().messages;
    return messages[messages.length - 1] || null;
  },
}));
