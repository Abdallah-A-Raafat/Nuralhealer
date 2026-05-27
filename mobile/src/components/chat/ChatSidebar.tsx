/**
 * Chat Sidebar Component (React Native)
 * Displays session list with search, rename, and delete functionality
 * Ported from web ChatSidebar.jsx to React Native + TypeScript
 *
 * Features:
 * - Session list with search/filter
 * - Inline rename editing
 * - Session deletion with confirmation
 * - Doctor access management
 * - Real-time session updates
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons, AntDesign, Entypo } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';

interface Session {
  id: string;
  sessionId?: string;
  sessionTitle?: string;
  sessionType?: string;
  startedAt?: string;
  messageCount?: number;
  status?: string;
}

interface ChatSidebarProps {
  sessions?: Session[];
  currentSession?: string | null;
  isLoading?: boolean;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onRenameSession?: (sessionId: string, newTitle: string) => Promise<void>;
  onDeleteSession?: (sessionId: string) => Promise<void>;
  onCloseSidebar?: () => void;
  authorizedDoctors?: any[];
  authorizedLoading?: boolean;
  authorizedError?: string;
  engagements?: any[];
  engagementsLoading?: boolean;
  onUpdateChatAccess?: (sessionId: string, doctorIds: string[]) => Promise<void>;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions = [],
  currentSession = null,
  isLoading = false,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  onCloseSidebar,
  authorizedDoctors = [],
  authorizedLoading = false,
  authorizedError = '',
  engagements = [],
  engagementsLoading = false,
  onUpdateChatAccess,
}) => {
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showAuthorized, setShowAuthorized] = useState(false);
  const [showAccessManagement, setShowAccessManagement] = useState(false);
  const [accessManagementSessionId, setAccessManagementSessionId] = useState<string | null>(null);
  const [selectedDoctors, setSelectedDoctors] = useState(new Set<string>());
  const [refreshing, setRefreshing] = useState(false);

  // Close dropdowns when switching sessions
  useEffect(() => {
    setShowAuthorized(false);
    setShowAccessManagement(false);
    setAccessManagementSessionId(null);
  }, [currentSession]);

  // Update selected doctors when authorized doctors/engagements change
  useEffect(() => {
    const doctorIds = new Set(authorizedDoctors.map((doc: any) => doc.id || doc.doctorId));
    const activeEngagementDoctors = engagements
      .filter((e: any) => e.status === 'active')
      .map((e: any) => e.doctor?.id);
    activeEngagementDoctors.forEach((id: string) => doctorIds.add(id));
    setSelectedDoctors(doctorIds);
  }, [authorizedDoctors, engagements, accessManagementSessionId]);

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter(
      (session) =>
        session.sessionTitle?.toLowerCase().includes(query) ||
        session.sessionType?.toLowerCase().includes(query)
    );
  }, [sessions, searchQuery]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return t('chat.yesterday') || 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const startEditing = (session: Session) => {
    setEditingSessionId(session.id);
    setEditTitle(session.sessionTitle || 'New AI Chat');
  };

  const saveEdit = async (sessionId: string) => {
    if (!editTitle.trim() || !onRenameSession) {
      setEditingSessionId(null);
      return;
    }

    try {
      await onRenameSession(sessionId, editTitle.trim());
      setEditingSessionId(null);
      setEditTitle('');
    } catch (error) {
      Alert.alert(t('chat.error') || 'Error', t('chat.failedToRename') || 'Failed to rename session');
    }
  };

  const cancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  const handleDeleteSession = (session: Session) => {
    Alert.alert(
      t('chat.deleteSession') || 'Delete Session?',
      t('chat.confirmDelete') || `Are you sure you want to delete "${session.sessionTitle}"?`,
      [
        { text: t('chat.cancel') || 'Cancel', onPress: () => {} },
        {
          text: t('chat.delete') || 'Delete',
          onPress: async () => {
            try {
              if (onDeleteSession) {
                await onDeleteSession(session.id);
              }
            } catch (error) {
              Alert.alert(t('chat.error') || 'Error', t('chat.failedToDelete') || 'Failed to delete session');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSaveAccess = async () => {
    if (!onUpdateChatAccess || !accessManagementSessionId) return;

    try {
      await onUpdateChatAccess(accessManagementSessionId, Array.from(selectedDoctors));
      setShowAccessManagement(false);
      setAccessManagementSessionId(null);
      Alert.alert(t('chat.success') || 'Success', t('chat.accessUpdated') || 'Access updated');
    } catch (error) {
      Alert.alert(t('chat.error') || 'Error', t('chat.failedToUpdateAccess') || 'Failed to update access');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Trigger parent refresh if available
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderSessionItem = ({ item: session }: { item: Session }) => {
    const isSelected = currentSession === session.id;
    const isEditing = editingSessionId === session.id;

    return (
      <TouchableOpacity
        style={[
          styles.sessionItem,
          {
            backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.card,
            borderColor: isSelected ? theme.colors.primary : theme.colors.inputBorder,
          },
        ]}
        onPress={() => !isEditing && onSelectSession(session.id)}
        activeOpacity={0.7}
      >
        {isEditing ? (
          // Inline Edit Mode
          <View style={styles.editContainer}>
            <TextInput
              style={[
                styles.editInput,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.inputBackground,
                },
              ]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Session title..."
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.colors.success }]}
              onPress={() => saveEdit(session.id)}
            >
              <MaterialIcons name="check" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.colors.error }]} onPress={cancelEdit}>
              <MaterialIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          // Display Mode
          <View style={styles.sessionContent}>
            <View style={styles.sessionInfo}>
              <Text
                numberOfLines={1}
                style={[
                  styles.sessionTitle,
                  {
                    color: isSelected ? theme.colors.primary : theme.colors.text,
                    fontWeight: isSelected ? 'bold' : 'normal',
                  },
                ]}
              >
                {session.sessionTitle || 'New AI Chat'}
              </Text>
              <Text style={[styles.sessionMeta, { color: theme.colors.textSecondary }]}>
                {session.sessionType === 'voice' ? '🎤 Voice' : '💬 Text'} •{' '}
                {formatDate(session.startedAt)}
              </Text>
              {session.messageCount ? (
                <Text style={[styles.messageCount, { color: theme.colors.textSecondary }]}>
                  {session.messageCount} messages
                </Text>
              ) : null}
            </View>

            <View style={styles.sessionActions}>
              {onRenameSession && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
                  onPress={() => startEditing(session)}
                >
                  <MaterialIcons
                    name="edit"
                    size={16}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              )}

              {onUpdateChatAccess && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor:
                        showAccessManagement && accessManagementSessionId === session.id
                          ? theme.colors.primary + '40'
                          : theme.colors.inputBackground,
                    },
                  ]}
                  onPress={() => {
                    const newShowState =
                      !showAccessManagement || accessManagementSessionId !== session.id;
                    setShowAccessManagement(newShowState);
                    setAccessManagementSessionId(newShowState ? session.id : null);
                    setShowAuthorized(false);
                  }}
                >
                  <MaterialIcons name="security" size={16} color={theme.colors.text} />
                </TouchableOpacity>
              )}

              {onDeleteSession && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.error + '20' }]}
                  onPress={() => handleDeleteSession(session)}
                >
                  <MaterialIcons name="delete" size={16} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="chat" size={48} color={theme.colors.textSecondary + '80'} />
      <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
        {searchQuery
          ? t('chat.noSessionsFound') || 'No sessions found'
          : t('chat.noSessions') || 'No chat sessions yet'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.inputBorder }]}>
        <View style={styles.headerTitle}>
          <MaterialIcons name="chat" size={20} color={theme.colors.primary} />
          <Text style={[styles.headerText, { color: theme.colors.text }]}>
            {t('chat.chatHistory') || 'Chat History'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onNewChat}
            activeOpacity={0.6}
          >
            <AntDesign name="plus" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
          {onCloseSidebar && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onCloseSidebar}
              activeOpacity={0.6}
            >
              <MaterialIcons name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <MaterialIcons name="search" size={18} color={theme.colors.textSecondary} />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.inputBorder,
            },
          ]}
          placeholder={t('chat.searchSessions') || 'Search sessions...'}
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sessions List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          scrollEnabled={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={[
            styles.listContent,
            filteredSessions.length === 0 && styles.listContentEmpty,
          ]}
        />
      )}

      {/* Access Management Panel */}
      {showAccessManagement && accessManagementSessionId && (
        <View style={[styles.accessPanel, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.accessPanelTitle, { color: theme.colors.text }]}>
            {t('chat.manageDoctorAccess') || 'Manage Doctor Access'}
          </Text>

          {authorizedLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : authorizedError ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{authorizedError}</Text>
          ) : (
            <View>
              {authorizedDoctors.map((doctor: any) => (
                <TouchableOpacity
                  key={doctor.id}
                  style={styles.doctorItem}
                  onPress={() => {
                    const newSelected = new Set(selectedDoctors);
                    if (newSelected.has(doctor.id)) {
                      newSelected.delete(doctor.id);
                    } else {
                      newSelected.add(doctor.id);
                    }
                    setSelectedDoctors(newSelected);
                  }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: selectedDoctors.has(doctor.id) ? theme.colors.primary : theme.colors.inputBackground,
                        borderColor: theme.colors.inputBorder,
                      },
                    ]}
                  >
                    {selectedDoctors.has(doctor.id) && (
                      <MaterialIcons name="check" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={[styles.doctorName, { color: theme.colors.text }]}>
                    {doctor.firstName} {doctor.lastName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.accessPanelButtons}>
            <TouchableOpacity
              style={[styles.panelButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSaveAccess}
            >
              <Text style={styles.panelButtonText}>{t('chat.save') || 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.panelButton, { backgroundColor: theme.colors.inputBackground }]}
              onPress={() => {
                setShowAccessManagement(false);
                setAccessManagementSessionId(null);
              }}
            >
              <Text style={[styles.panelButtonText, { color: theme.colors.text }]}>
                {t('chat.cancel') || 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionItem: {
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1.5,
  },
  sessionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  sessionMeta: {
    fontSize: 12,
    marginBottom: 2,
  },
  messageCount: {
    fontSize: 11,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  accessPanel: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 300,
  },
  accessPanelTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 13,
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 8,
  },
  accessPanelButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  panelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ChatSidebar;
