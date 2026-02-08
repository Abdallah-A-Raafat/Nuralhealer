import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card, Button } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import userService from '../../services/userService';
import engagementService, { Engagement } from '../../services/engagementService';
import type { PatientTabScreenProps } from '../../navigation/types';

type ProfileScreenProps = PatientTabScreenProps<'Profile'>;

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileScreenProps['navigation']>();
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'engagements'>('overview');
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    voiceSessions: 0,
    textSessions: 0,
  });
  const [sessions, setSessions] = useState([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);

  // Engagement modal states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [_selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);
  const [verifying, setVerifying] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load stats for overview tab
      if (activeTab === 'overview') {
        const userStats = await userService.getUserStats();
        setStats(userStats);
      }
      
      // Load sessions for sessions tab
      if (activeTab === 'sessions') {
        const sessionHistory = await userService.getSessionHistory();
        setSessions(sessionHistory);
      }
      
      // Load engagements for engagements tab
      if (activeTab === 'engagements') {
        const myEngagements = await engagementService.getMyEngagements();
        setEngagements(myEngagements || []);
      }
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVerifyEngagement = async (engagement: Engagement) => {
    setSelectedEngagement(engagement);
    setShowVerifyModal(true);
  };

  const confirmVerify = async () => {
    if (!verificationToken.trim()) {
      Alert.alert(t('common.error'), t('engagement.enterToken'));
      return;
    }

    try {
      setVerifying(true);
      await engagementService.verifyEngagement(verificationToken);
      Alert.alert(t('common.success'), t('engagement.verificationSuccess'));
      setVerificationToken('');
      setShowVerifyModal(false);
      await loadData();
    } catch (error: any) {
      console.error('Verification failed:', error);
      Alert.alert(t('common.error'), error.response?.data?.message || t('engagement.verificationFailed'));
    } finally {
      setVerifying(false);
    }
  };

  const handleRejectEngagement = (engagement: Engagement) => {
    Alert.alert(
      t('engagement.rejectTitle'),
      t('engagement.rejectConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('engagement.reject'),
          style: 'destructive',
          onPress: async () => {
            try {
              await engagementService.rejectEngagement(engagement.id, 'Rejected by patient');
              Alert.alert(t('common.success'), t('engagement.rejectSuccess'));
              await loadData();
            } catch (error: any) {
              Alert.alert(t('common.error'), error.response?.data?.message || t('common.error'));
            }
          },
        },
      ]
    );
  };

  const handleCancelEngagement = (engagement: Engagement) => {
    Alert.alert(
      t('engagement.cancelTitle'),
      t('engagement.cancelConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('engagement.cancel'),
          style: 'destructive',
          onPress: async () => {
            try {
              await engagementService.cancelEngagement(engagement.id, 'Cancelled by patient', 'LIMITED_ACCESS');
              Alert.alert(t('common.success'), t('engagement.cancelSuccess'));
              await loadData();
            } catch (error: any) {
              Alert.alert(t('common.error'), error.response?.data?.message || t('common.error'));
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const renderOverviewTab = () => (
    <View>
      {/* Profile Info */}
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Text>
        </View>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
          {user?.email}
        </Text>
        <Text style={[styles.userRole, { color: theme.colors.primary }]}>
          {user?.role}
        </Text>
      </Card>

      {/* Stats */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t('profile.statistics')}
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {stats.totalSessions}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {t('profile.totalSessions')}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {stats.totalMinutes}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {t('profile.minutes')}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>🎤</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {stats.voiceSessions}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {t('profile.voiceSessions')}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {stats.textSessions}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {t('profile.textSessions')}
            </Text>
          </Card>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t('profile.actions')}
      </Text>
      <Card style={styles.menuCard}>
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.menuIcon}>✏️</Text>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>
            {t('profile.editProfile')}
          </Text>
          <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={[styles.menuText, { color: theme.colors.text }]}>
            {t('nav.settings')}
          </Text>
          <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleLogout}
        >
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuText, { color: '#EF4444' }]}>
            {t('auth.logout')}
          </Text>
          <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );

  const renderSessionsTab = () => (
    <View>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : sessions.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t('profile.noSessions')}
          </Text>
        </Card>
      ) : (
        sessions.map((session: any, index) => (
          <Card key={index} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionIcon}>{session.sessionType === 'voice' ? '🎤' : '💬'}</Text>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionTitle, { color: theme.colors.text }]}>
                  {session.sessionType === 'voice' ? t('profile.voiceSession') : t('profile.textSession')}
                </Text>
                <Text style={[styles.sessionDate, { color: theme.colors.textSecondary }]}>
                  {new Date(session.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            {session.duration && (
              <Text style={[styles.sessionDuration, { color: theme.colors.textSecondary }]}>
                {t('profile.duration')}: {session.duration} {t('profile.minutes')}
              </Text>
            )}
          </Card>
        ))
      )}
    </View>
  );

  const renderEngagementsTab = () => {
    const pendingEngagements = engagements.filter(e => e.status === 'pending');
    const activeEngagements = engagements.filter(e => e.status === 'active');
    const endedEngagements = engagements.filter(e => e.status === 'ended' || e.status === 'cancelled');

    return (
      <View>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <>
            {/* Pending */}
            {pendingEngagements.length > 0 && (
              <>
                <Text style={[styles.engagementSection, { color: theme.colors.text }]}>
                  {t('engagement.pending')}
                </Text>
                {pendingEngagements.map((engagement) => (
                  <Card key={engagement.id} style={styles.engagementCard}>
                    <View style={styles.engagementHeader}>
                      <View style={[styles.statusBadge, { backgroundColor: '#F59E0B20' }]}>
                        <Text style={[styles.statusText, { color: '#F59E0B' }]}>
                          {t('engagement.pending')}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.engagementDoctor, { color: theme.colors.text }]}>
                      Dr. {engagement.doctor?.firstName} {engagement.doctor?.lastName}
                    </Text>
                    <Text style={[styles.engagementDate, { color: theme.colors.textSecondary }]}>
                      {new Date(engagement.createdAt).toLocaleDateString()}
                    </Text>
                    <View style={styles.engagementActions}>
                      <Button
                        title={t('engagement.verify')}
                        onPress={() => handleVerifyEngagement(engagement)}
                        style={styles.actionButton}
                      />
                      <Button
                        title={t('engagement.reject')}
                        onPress={() => handleRejectEngagement(engagement)}
                        variant="outline"
                        style={styles.actionButton}
                      />
                    </View>
                  </Card>
                ))}
              </>
            )}

            {/* Active */}
            {activeEngagements.length > 0 && (
              <>
                <Text style={[styles.engagementSection, { color: theme.colors.text }]}>
                  {t('engagement.active')}
                </Text>
                {activeEngagements.map((engagement) => (
                  <Card key={engagement.id} style={styles.engagementCard}>
                    <View style={styles.engagementHeader}>
                      <View style={[styles.statusBadge, { backgroundColor: '#22C55E20' }]}>
                        <Text style={[styles.statusText, { color: '#22C55E' }]}>
                          {t('engagement.active')}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.engagementDoctor, { color: theme.colors.text }]}>
                      Dr. {engagement.doctor?.firstName} {engagement.doctor?.lastName}
                    </Text>
                    <Text style={[styles.engagementAccess, { color: theme.colors.textSecondary }]}>
                      {t('engagement.accessLevel')}: {engagement.accessLevel}
                    </Text>
                    <Button
                      title={t('engagement.cancel')}
                      onPress={() => handleCancelEngagement(engagement)}
                      variant="outline"
                      style={styles.cancelButton}
                    />
                  </Card>
                ))}
              </>
            )}

            {/* Ended */}
            {endedEngagements.length > 0 && (
              <>
                <Text style={[styles.engagementSection, { color: theme.colors.text }]}>
                  {t('engagement.ended')}
                </Text>
                {endedEngagements.map((engagement) => (
                  <Card key={engagement.id} style={styles.engagementCard}>
                    <View style={styles.engagementHeader}>
                      <View style={[styles.statusBadge, { backgroundColor: '#6B7280' + '20' }]}>
                        <Text style={[styles.statusText, { color: '#6B7280' }]}>
                          {engagement.status === 'ended' ? t('engagement.ended') : t('engagement.cancelled')}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.engagementDoctor, { color: theme.colors.text }]}>
                      Dr. {engagement.doctor?.firstName} {engagement.doctor?.lastName}
                    </Text>
                    <Text style={[styles.engagementDate, { color: theme.colors.textSecondary }]}>
                      {new Date(engagement.createdAt).toLocaleDateString()}
                    </Text>
                  </Card>
                ))}
              </>
            )}

            {engagements.length === 0 && (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🤝</Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  {t('engagement.noEngagements')}
                </Text>
              </Card>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[styles.header, { color: theme.colors.text }]}>
          {t('profile.title')}
        </Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'overview' && styles.activeTab,
              { borderBottomColor: activeTab === 'overview' ? theme.colors.primary : 'transparent' },
            ]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'overview' ? theme.colors.primary : theme.colors.textSecondary },
            ]}>
              {t('profile.overview')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'sessions' && styles.activeTab,
              { borderBottomColor: activeTab === 'sessions' ? theme.colors.primary : 'transparent' },
            ]}
            onPress={() => setActiveTab('sessions')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'sessions' ? theme.colors.primary : theme.colors.textSecondary },
            ]}>
              {t('profile.sessions')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'engagements' && styles.activeTab,
              { borderBottomColor: activeTab === 'engagements' ? theme.colors.primary : 'transparent' },
            ]}
            onPress={() => setActiveTab('engagements')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'engagements' ? theme.colors.primary : theme.colors.textSecondary },
            ]}>
              {t('profile.engagements')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'sessions' && renderSessionsTab()}
          {activeTab === 'engagements' && renderEngagementsTab()}
        </View>
      </ScrollView>

      {/* Verification Modal */}
      <Modal
        visible={showVerifyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVerifyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('engagement.verifyTitle')}
            </Text>
            <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
              {t('engagement.verifyDescription')}
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              placeholder={t('engagement.enterToken')}
              placeholderTextColor={theme.colors.textSecondary}
              value={verificationToken}
              onChangeText={setVerificationToken}
              autoCapitalize="characters"
            />
            <View style={styles.modalButtons}>
              <Button
                title={t('common.cancel')}
                onPress={() => {
                  setShowVerifyModal(false);
                  setVerificationToken('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={t('engagement.verify')}
                onPress={confirmVerify}
                loading={verifying}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    alignItems: 'center',
  },
  activeTab: {
    // Border color set dynamically
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8E44AD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  menuCard: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  menuArrow: {
    fontSize: 24,
  },
  sessionCard: {
    padding: 16,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
  },
  sessionDuration: {
    fontSize: 14,
    marginTop: 4,
  },
  engagementSection: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  engagementCard: {
    padding: 16,
    marginBottom: 12,
  },
  engagementHeader: {
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  engagementDoctor: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  engagementDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  engagementAccess: {
    fontSize: 14,
    marginBottom: 12,
  },
  engagementActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    marginTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default ProfileScreen;
