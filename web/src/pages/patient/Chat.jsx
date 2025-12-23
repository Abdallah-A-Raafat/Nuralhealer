import { useState } from 'react';
import Button from '../../components/common/Button';

const Chat = () => {
  const [selectedSession, setSelectedSession] = useState(null);

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
          <h1 className="text-4xl font-bold text-textPrimary mb-4">AI Therapy Session</h1>
          <p className="text-lg text-textSecondary">
            Choose how you'd like to connect with your AI therapist today
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
              <h2 className="text-2xl font-bold text-textPrimary text-center mb-2">Text Session</h2>
              <p className="text-textSecondary text-center">
                Chat with your AI therapist using text. Take your time to express your thoughts and feelings.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <p className="text-sm font-semibold text-textPrimary">Features:</p>
              <ul className="text-sm text-textSecondary space-y-1">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Real-time AI responses
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Session transcript saved
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Emotion analysis included
                </li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="large"
              className="w-full"
              onClick={() => setSelectedSession('text')}
            >
              Start Text Session
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
              <h2 className="text-2xl font-bold text-textPrimary text-center mb-2">Sound Session</h2>
              <p className="text-textSecondary text-center">
                Have a natural conversation with your AI therapist using voice. Perfect for when you prefer speaking.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <p className="text-sm font-semibold text-textPrimary">Features:</p>
              <ul className="text-sm text-textSecondary space-y-1">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Voice-to-text conversion
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Natural conversation flow
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  AI voice responses
                </li>
              </ul>
            </div>

            <Button
              variant="secondary"
              size="large"
              className="w-full"
              onClick={() => setSelectedSession('sound')}
            >
              Start Sound Session
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-3xl mx-auto mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tip</h3>
          <p className="text-blue-800 text-sm">
            Choose the session type that feels most comfortable for you. You can switch between text and voice during your sessions, and all conversations are private and encrypted.
          </p>
        </div>
      </div>
    </div>
  );
};

// Text Session Component
const TextSession = ({ onBack }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your AI therapist. Welcome to NeuralHealer. How are you feeling today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: "That sounds important. Can you tell me more about what you're experiencing?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-textPrimary">Text Session</h1>
          <button
            onClick={onBack}
            className="text-textSecondary hover:text-textPrimary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md h-96 overflow-y-auto p-6 space-y-4 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-gray-100 text-textPrimary rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-textSecondary'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-textPrimary px-4 py-2 rounded-lg rounded-bl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-textSecondary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-textSecondary rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-textSecondary rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message here..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sound Session Component
const SoundSession = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sessionMessages, setSessionMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your AI therapist. Welcome to NeuralHealer. How are you feeling today?",
      timestamp: new Date(),
    },
  ]);

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      setTranscript("I've been feeling a bit overwhelmed with work lately.");
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
        content: "Work stress can be really challenging. Tell me more about what's making you feel overwhelmed.",
        timestamp: new Date(),
      };
      setSessionMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-textPrimary">Sound Session</h1>
          <button
            onClick={onBack}
            className="text-textSecondary hover:text-textPrimary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
                <p className="text-sm">{message.content}</p>
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
              {isRecording ? 'Recording...' : transcript ? 'Ready to send' : 'Click below to speak'}
            </p>
          </div>

          {transcript && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 font-medium mb-2">Your message:</p>
              <p className="text-sm text-blue-800">{transcript}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleStartRecording}
              disabled={isRecording}
              className="flex-1 bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 font-medium"
            >
              {isRecording ? 'Recording...' : 'Start Recording'}
            </button>
            {transcript && (
              <button
                onClick={handleSubmitTranscript}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Send
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs text-amber-800">
            <strong>Note:</strong> Voice recognition will be fully integrated with the Web Speech API in the production version.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
