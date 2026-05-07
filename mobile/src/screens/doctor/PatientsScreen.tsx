import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Modal,
  Clipboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card, Button } from '../../components/common';
import { useThemeStore } from '../../store/themeStore';
import userService from '../../services/userService';
import engagementService, { Engagement } from '../../services/engagementService';
import type { DoctorTabScreenProps } from '../../navigation/types';

type PatientsScreenProps = DoctorTabScreenProps<'Patients'>;

const PatientsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<PatientsScreenProps['navigation']>();
  const { theme } = useThemeStore();

  // Engagements list
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);

  // Search modal states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('FULL_ACCESS');

  // Token modal states
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [currentToken, setCurrentToken] = useState('');
  const [tokenExpiry, setTokenExpiry] = useState('');

  useEffect(() => {
    fetchEngagements();
  }, [fetchEngagements]);

  const fetchEngagements = useCallback(async () => {
    try {
      setLoading(true);
      const data = await engagementService.getMyEngagements();
      setEngagements(data || []);
    } catch (error) {
      console.error('Failed to load engagements:', error);
      Alert.alert(t('common.error'), t('doctor.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleSearchPatient = async () => {
    if (!searchEmail.trim()) return;

    try {
      setSearching(true);
      setSearchResult(null);
      setSearchError('');
      
      const response = await userService.searchUserByEmail(searchEmail);

      if (response && response.role === 'PATIENT') {
        setSearchResult(response);
      } else {
        setSearchError(t('doctor.userNotPatient'));
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError(t('doctor.patientNotFound'));
    } finally {
      setSearching(false);
    }
  };

  const handleSendEngagementRequest = async () => {
    if (!searchResult) return;

    try {
      const response = await engagementService.initiateEngagement(
        searchResult.id,
        selectedAccessLevel
      );
      
      // Show token modal
      setCurrentToken(response.verification.token);
      setTokenExpiry(response.verification.expiresAt);
      setShowTokenModal(true);
      
      // Reset search modal
      setShowSearchModal(false);
      setSearchEmail('');
      setSearchResult(null);
      setSelectedAccessLevel('FULL_ACCESS');
      fetchEngagements();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('doctor.requestError'));
    }
  };

  const handleCopyToken = () => {
    Clipboard.setString(currentToken);
    Alert.alert(t('common.success'), t('doctor.tokenCopied'));
  };

  const handleViewToken = async (engagementId: string) => {
    try {
      const response = await engagementService.getCurrentToken(engagementId);
      setCurrentToken(response.token);
      setTokenExpiry(response.expiresAt);
      setShowTokenModal(true);
    } catch (error) {
      // Token might be expired, try to refresh
      console.log('Token error:', error);
      try {
        const refreshResponse = await engagementService.refreshToken(engagementId);
        setCurrentToken(refreshResponse.token);
        setTokenExpiry(refreshResponse.expiresAt);
        setShowTokenModal(true);
        fetchEngagements();
      } catch (refreshErr: any) {
        Alert.alert(t('common.error'), refreshErr.response?.data?.message || t('doctor.failedToGetToken'));
      }
    }
  };

  const handleDeleteEngagement = (engagementId: string) => {
    Alert.alert(
      t('doctor.deleteTitle'),
      t('doctor.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await engagementService.deleteEngagement(engagementId);
              Alert.alert(t('common.success'), t('doctor.deleteSuccess'));
              fetchEngagements();
            } catch (err: any) {
              Alert.alert(t('common.error'), err.response?.data?.message || t('common.error'));
            }
          },
        },
      ]
    );
  };

  const handleCancelEngagement = (engagementId: string) => {
    Alert.alert(
      t('doctor.cancelTitle'),
      t('doctor.cancelConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('doctor.cancelEngagement'),
          style: 'destructive',
          onPress: async () => {
            try {
              await engagementService.cancelEngagement(engagementId, 'Cancelled by doctor', null);
              Alert.alert(t('common.success'), t('doctor.cancelSuccess'));
              fetchEngagements();
            } catch (err: any) {
              Alert.alert(t('common.error'), err.response?.data?.message || t('common.error'));
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t('engagement.pending'), color: '#F59E0B', bgColor: '#F59E0B20' },
      active: { label: t('engagement.active'), color: '#22C55E', bgColor: '#22C55E20' },
      ended: { label: t('engagement.ended'), color: '#6B7280', bgColor: '#6B728020' },
      cancelled: { label: t('engagement.cancelled'), color: '#EF4444', bgColor: '#EF444420' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const pendingEngagements = engagements.filter(e => e.status === 'pending');
  const activeEngagements = engagements.filter(e => e.status === 'active');

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('doctor.myPatients')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('doctor.manageEngagements')}
          </Text>
        </View>
        <Button
          title={t('doctor.addPatient')}
          variant="primary"
          onPress={() => setShowSearchModal(true)}
        />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : engagements.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {t('doctor.noPatients')}
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('doctor.noPatientsDesc')}
            </Text>
            <Button
              title={t('doctor.addPatient')}
              variant="primary"
              onPress={() => setShowSearchModal(true)}
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          <>
            {/* Pending Engagements */}
            {pendingEngagements.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {t('doctor.pendingRequests')}
                </Text>
                {pendingEngagements.map(engagement => (
                  <Card key={engagement.id} style={styles.engagementCard}>
                    <View style={styles.engagementHeader}>
                      <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.avatarText}>
                          {engagement.patient?.firstName?.[0]}{engagement.patient?.lastName?.[0]}
                        </Text>
                      </View>
                      <View style={styles.engagementInfo}>
                        <Text style={[styles.patientName, { color: theme.colors.text }]}>
                          {engagement.patient?.firstName} {engagement.patient?.lastName}
                        </Text>
                        <Text style={[styles.patientEmail, { color: theme.colors.textSecondary }]}>
                          {engagement.patient?.email}
                        </Text>
                      </View>
                      {getStatusBadge(engagement.status)}
                    </View>
                    <View style={styles.engagementActions}>
                      <Button
                        title={t('doctor.viewToken')}
                        variant="outline"
                        onPress={() => handleViewToken(engagement.id)}
                        style={styles.actionButton}
                      />
                      <Button
                        title={t('common.delete')}
                        variant="outline"
                        onPress={() => handleDeleteEngagement(engagement.id)}
                        style={styles.actionButton}
                        textStyle={styles.deleteButtonText}
                      />
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* Active Engagements */}
            {activeEngagements.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {t('doctor.activeEngagements')}
                </Text>
                {activeEngagements.map(engagement => (
                  <Card key={engagement.id} style={styles.engagementCard}>
                    <View style={styles.engagementHeader}>
                      <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.avatarText}>
                          {engagement.patient?.firstName?.[0]}{engagement.patient?.lastName?.[0]}
                        </Text>
                      </View>
                      <View style={styles.engagementInfo}>
                        <Text style={[styles.patientName, { color: theme.colors.text }]}>
                          {engagement.patient?.firstName} {engagement.patient?.lastName}
                        </Text>
                        <Text style={[styles.patientEmail, { color: theme.colors.textSecondary }]}>
                          {engagement.patient?.email}
                        </Text>
                        <Text style={[styles.accessLevel, { color: theme.colors.textSecondary }]}>
                          {t('engagement.accessLevel')}: {engagement.accessLevel}
                        </Text>
                      </View>
                      {getStatusBadge(engagement.status)}
                    </View>
                    <View style={styles.engagementActions}>
                      <Button
                        title={t('doctor.viewProfile')}
                        variant="primary"
                        onPress={() => navigation.navigate('PatientDetail', { patientId: engagement.patientId })}
                        style={styles.actionButton}
                      />
                      <Button
                        title={t('doctor.cancelEngagement')}
                        variant="outline"
                        onPress={() => handleCancelEngagement(engagement.id)}
                        style={styles.actionButton}
                        textStyle={styles.cancelButtonText}
                      />
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Search Patient Modal */}
      <Modal
        visible={showSearchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('doctor.searchPatient')}
            </Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.inputBackground, 
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              placeholder={t('doctor.enterPatientEmail')}
              placeholderTextColor={theme.colors.placeholder}
              value={searchEmail}
              onChangeText={setSearchEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Button
              title={searching ? t('common.loading') : t('common.search')}
              variant="primary"
              onPress={handleSearchPatient}
              disabled={searching || !searchEmail.trim()}
              style={styles.modalButton}
            />

            {searchError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{searchError}</Text>
              </View>
            ) : null}

            {searchResult ? (
              <View style={styles.resultContainer}>
                <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
                  {t('doctor.patientFound')}
                </Text>
                <Text style={[styles.resultText, { color: theme.colors.text }]}>
                  {searchResult.firstName} {searchResult.lastName}
                </Text>
                <Text style={[styles.resultEmail, { color: theme.colors.textSecondary }]}>
                  {searchResult.email}
                </Text>
                
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  {t('engagement.accessLevel')}
                </Text>
                <View style={[styles.picker, { borderColor: theme.colors.border }]}>
                  {['FULL_ACCESS', 'LIMITED_ACCESS', 'NO_ACCESS'].map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.pickerOption,
                        selectedAccessLevel === level && {
                          backgroundColor: theme.colors.primary + '20',
                        },
                      ]}
                      onPress={() => setSelectedAccessLevel(level)}
                    >
                      <Text style={[
                        styles.pickerText,
                        { color: selectedAccessLevel === level ? theme.colors.primary : theme.colors.text },
                      ]}>
                        {t(`doctor.${level.toLowerCase()}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Button
                  title={t('doctor.sendRequest')}
                  variant="primary"
                  onPress={handleSendEngagementRequest}
                  style={styles.modalButton}
                />
              </View>
            ) : null}
            
            <Button
              title={t('common.cancel')}
              variant="outline"
              onPress={() => {
                setShowSearchModal(false);
                setSearchEmail('');
                setSearchResult(null);
                setSearchError('');
              }}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Token Modal */}
      <Modal
        visible={showTokenModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTokenModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.tokenModalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('doctor.verificationToken')}
            </Text>
            
            <View style={styles.tokenContainer}>
              <Text style={[styles.token, { color: theme.colors.primary }]}>
                {currentToken}
              </Text>
              <TouchableOpacity
                style={[styles.copyButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleCopyToken}
              >
                <Text style={styles.copyButtonText}>📋 {t('common.copy')}</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.tokenExpiry, { color: theme.colors.textSecondary }]}>
              {t('doctor.expiresAt')}: {new Date(tokenExpiry).toLocaleString()}
            </Text>
            
            <Text style={[styles.tokenInstructions, { color: theme.colors.textSecondary }]}>
              {t('doctor.tokenInstructions')}
            </Text>
            
            <Button
              title={t('common.close')}
              variant="primary"
              onPress={() => setShowTokenModal(false)}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  engagementCard: {
    padding: 16,
    marginBottom: 12,
  },
  engagementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  engagementInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  patientEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  accessLevel: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  engagementActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  cancelButtonText: {
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  tokenModalContent: {
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButton: {
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  resultContainer: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerText: {
    fontSize: 14,
  },
  tokenContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  token: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 2,
  },
  copyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tokenExpiry: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  tokenInstructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
});

export default PatientsScreen;
