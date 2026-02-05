import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../common/Button';
import chatService from '../../services/chatService';
import { showToast } from '../../utils/toast';

/**
 * ChatHistory Component
 * 
 * Displays a list of previous chat sessions with the ability to view details.
 * This component is ready for backend integration once the API endpoints are available.
 * 
 * Backend Requirements:
 * - GET /api/chat/sessions?page=0&size=10 - List all sessions
 * - GET /api/chat/sessions/{sessionId} - Get specific session details
 * - Database: chat_sessions table with: session_id, start_time, end_time, message_count, status
 */
const ChatHistory = ({ onViewSession }) => {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Uncomment when backend is ready
      // const response = await chatService.getSessionHistory(currentPage, 10);
      // setSessions(response.content || []);
      // setTotalPages(response.totalPages || 0);
      
      // Mock data for now - remove when backend is ready
      setSessions([
        {
          sessionId: '1',
          startTime: new Date(Date.now() - 86400000).toISOString(),
          endTime: new Date(Date.now() - 83400000).toISOString(),
          messageCount: 15,
          status: 'completed',
          sessionType: 'text'
        },
        {
          sessionId: '2',
          startTime: new Date(Date.now() - 172800000).toISOString(),
          endTime: new Date(Date.now() - 169800000).toISOString(),
          messageCount: 22,
          status: 'completed',
          sessionType: 'sound'
        }
      ]);
      
    } catch (error) {
      console.error('Error fetching chat history:', error);
      showToast.error(t.chat?.historyError || 'Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    return `${minutes} ${t.chat?.minutes || 'minutes'}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-textPrimary mb-2">
          {t.chat?.noHistory || 'No previous sessions'}
        </h3>
        <p className="text-textSecondary">
          {t.chat?.noHistoryDesc || 'Your completed therapy sessions will appear here'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-textPrimary">
          {t.chat?.sessionHistory || 'Session History'}
        </h2>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.sessionId}
            className="bg-white dark:bg-[#241D30] border border-gray-200 dark:border-[#3F3651] rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    session.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium text-textPrimary dark:text-white">
                    {session.sessionType === 'text' ? t.chat?.textSession : t.chat?.soundSession}
                  </span>
                  <span className="text-xs text-textSecondary dark:text-gray-400">
                    • {session.messageCount} {t.chat?.messages || 'messages'}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-textSecondary dark:text-gray-400">
                    {t.chat?.sessionDate || 'Date'}: {formatDate(session.startTime)}
                  </p>
                  <p className="text-sm text-textSecondary dark:text-gray-400">
                    {t.chat?.sessionDuration || 'Duration'}: {formatDuration(session.startTime, session.endTime)}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="small"
                onClick={() => onViewSession && onViewSession(session.sessionId)}
              >
                {t.chat?.viewSession || 'View'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination - Ready for backend */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="small"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            {t.common?.previous || 'Previous'}
          </Button>
          <span className="flex items-center px-4 text-sm text-textSecondary">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="small"
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
          >
            {t.common?.next || 'Next'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
