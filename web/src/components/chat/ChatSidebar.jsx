import { useState, useMemo } from 'react';
import { MessageSquare, Plus, Search, Calendar, MessageCircle, Edit2, Check, X } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

/**
 * Chat Sidebar Component
 * Displays chat history with search and session management
 * Similar to stomp-test.html sidebar
 */
const ChatSidebar = ({
  sessions = [],
  currentSession,
  isLoading = false,
  onSelectSession,
  onNewChat,
  onRenameSession
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter sessions based on search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    
    const query = searchQuery.toLowerCase();
    return sessions.filter(session => 
      session.sessionTitle?.toLowerCase().includes(query) ||
      session.sessionType?.toLowerCase().includes(query)
    );
  }, [sessions, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return t.chat?.yesterday || 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const startEditing = (session, e) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.sessionTitle || 'New AI Chat');
  };

  const saveEdit = async (sessionId, e) => {
    e.stopPropagation();
    if (editTitle.trim() && onRenameSession) {
      await onRenameSession(sessionId, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingSessionId(null);
    setEditTitle('');
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t.chat?.chatHistory || 'Chat History'}
            </h2>
          </div>
          <button
            onClick={onNewChat}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title={t.chat?.newChat || 'New Chat'}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t.chat?.searchSessions || 'Search sessions...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 px-4">
            <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm text-center">
              {searchQuery 
                ? (t.chat?.noSessionsFound || 'No sessions found')
                : (t.chat?.noSessions || 'No chat sessions yet')}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`
                  w-full text-left p-3 rounded-lg transition-all duration-200
                  ${currentSession === session.id 
                    ? 'bg-primary-50 border-2 border-primary-500 shadow-sm' 
                    : 'hover:bg-gray-50 border-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  {editingSessionId === session.id ? (
                    /* Inline Edit Mode */
                    <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(session.id, e);
                          if (e.key === 'Escape') cancelEdit(e);
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoFocus
                      />
                      <button
                        onClick={(e) => saveEdit(session.id, e)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* Normal Display Mode */
                    <>
                      <h3 className={`
                        font-medium text-sm line-clamp-1 flex-1
                        ${currentSession === session.id ? 'text-primary-900' : 'text-gray-900'}
                      `}>
                        {session.sessionTitle || 'New AI Chat'}
                      </h3>
                      <div className="flex items-center gap-1">
                        {onRenameSession && (
                          <button
                            onClick={(e) => startEditing(session, e)}
                            className={`
                              p-1 rounded transition-colors
                              ${currentSession === session.id 
                                ? 'text-primary-600 hover:bg-primary-100' 
                                : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'}
                            `}
                            title={t.chat?.rename || 'Rename'}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                        {session.messageCount > 0 && (
                          <span className={`
                            text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap
                            ${currentSession === session.id 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-200 text-gray-700'}
                          `}>
                            {session.messageCount}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(session.startedAt)}
                  </span>
                  {session.isActive && (
                    <span className="flex items-center gap-1 text-green-600">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                      {t.chat?.active || 'Active'}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Session Count */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          {sessions.length} {sessions.length === 1 
            ? (t.chat?.session || 'session') 
            : (t.chat?.sessions || 'sessions')}
        </p>
      </div>
    </div>
  );
};

export default ChatSidebar;
