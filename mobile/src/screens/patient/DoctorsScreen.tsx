/**
 * Doctors Lobby Screen
 * Browse and book sessions with doctors
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import doctorService, { Doctor } from '../../services/doctorService';
import engagementService from '../../services/engagementService';

// Doctor Card Component
const DoctorCard: React.FC<{
  doctor: Doctor;
  onSendRequest: () => void;
  isSendingRequest: boolean;
  theme: any;
}> = ({ doctor, onSendRequest, isSendingRequest, theme }) => {
  const { t } = useTranslation();
  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={[
              styles.star,
              { color: star <= Math.floor(rating) ? '#F59E0B' : '#D1D5DB' },
            ]}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.doctorCard, { backgroundColor: theme.colors.card }]}>
      {/* Header with gradient effect */}
      <View style={[styles.cardHeader, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.avatarEmoji}>👨‍⚕️</Text>
        <Text style={styles.doctorName}>{fullName}</Text>
        <Text style={styles.specialization}>{doctor.specialization || 'Psychiatrist'}</Text>
      </View>

      {/* Doctor Info */}
      <View style={styles.cardBody}>
        {/* Rating */}
        <View style={styles.ratingRow}>
          {renderStars(doctor.rating || 0)}
          <Text style={[styles.ratingText, { color: theme.colors.text }]}>
            {doctor.rating?.toFixed(1) || '0.0'}
          </Text>
          <Text style={[styles.reviewCount, { color: theme.colors.textSecondary }]}>
            ({doctor.reviews || 0} {t('doctors.reviews')})
          </Text>
        </View>

        {/* Experience */}
        {doctor.experience && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              {t('doctors.experience')}:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {doctor.experience}
            </Text>
          </View>
        )}

        {/* Bio */}
        {doctor.bio && (
          <Text
            style={[styles.bio, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {doctor.bio}
          </Text>
        )}

        {/* Availability */}
        {doctor.availability && (
          <View style={[styles.availabilityBox, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[styles.availabilityLabel, { color: '#1E40AF' }]}>
              {t('doctors.available')}:
            </Text>
            <Text style={[styles.availabilityValue, { color: '#1E3A8A' }]}>
              {doctor.availability}
            </Text>
          </View>
        )}

        {/* Price and Request Button */}
        <View style={styles.cardFooter}>
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            ${doctor.price || 50}/session
          </Text>
          <TouchableOpacity
            style={[styles.bookButton, { backgroundColor: theme.colors.primary }]}
            onPress={onSendRequest}
            disabled={isSendingRequest}
          >
            {isSendingRequest ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.bookButtonText}>
                {t('engagement.sendRequest') || 'Send Request'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Main Doctors Screen
const DoctorsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestingDoctorId, setRequestingDoctorId] = useState<string | null>(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await doctorService.getAllDoctors();
      setDoctors(data || []);
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Failed to load doctors. Please try again.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEngagementRequest = async (doctor: Doctor) => {
    try {
      setRequestingDoctorId(doctor.id);
      await engagementService.initiatePatientEngagement(
        doctor.userId || doctor.id,
        'FULL_ACCESS',
        null
      );
      Alert.alert(
        t('common.success'),
        t('engagement.requestSent') || 'Engagement request sent. Please wait for doctor verification.'
      );
    } catch (err) {
      console.error('Engagement request error:', err);
      Alert.alert(t('common.error'), 'Could not send engagement request. Please try again.');
    } finally {
      setRequestingDoctorId(null);
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('doctors.title')}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {t('doctors.description')}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder={t('doctors.searchPlaceholder')}
          placeholderTextColor={theme.colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Doctor List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            {t('common.loading')}...
          </Text>
        </View>
      ) : filteredDoctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👨‍⚕️</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t('doctors.noResults')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DoctorCard
              doctor={item}
              theme={theme}
              isSendingRequest={requestingDoctorId === item.id}
              onSendRequest={() => handleSendEngagementRequest(item)}
            />
          )}
          contentContainerStyle={styles.doctorList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  headerSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  searchContainer: { paddingHorizontal: 16, marginBottom: 12 },
  searchInput: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  doctorList: { padding: 16 },
  doctorCard: { borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardHeader: { padding: 20, alignItems: 'center' },
  avatarEmoji: { fontSize: 48, marginBottom: 8 },
  doctorName: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  specialization: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  cardBody: { padding: 16 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  starsContainer: { flexDirection: 'row' },
  star: { fontSize: 16, marginHorizontal: 1 },
  ratingText: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  reviewCount: { fontSize: 12, marginLeft: 4 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { fontSize: 13, marginRight: 4 },
  infoValue: { fontSize: 13, fontWeight: '500' },
  bio: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  availabilityBox: { borderRadius: 8, padding: 10, marginBottom: 12 },
  availabilityLabel: { fontSize: 12, fontWeight: '500' },
  availabilityValue: { fontSize: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  price: { fontSize: 18, fontWeight: 'bold' },
  bookButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  bookButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});

export default DoctorsScreen;
