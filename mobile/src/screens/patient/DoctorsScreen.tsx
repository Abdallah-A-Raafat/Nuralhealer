/**
 * Doctors Lobby Screen
 * Browse and book sessions with doctors
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import doctorService, { Doctor } from '../../services/doctorService';

// Doctor Card Component
const DoctorCard: React.FC<{
  doctor: Doctor;
  onBook: () => void;
  theme: any;
}> = ({ doctor, onBook, theme }) => {
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

        {/* Price and Book Button */}
        <View style={styles.cardFooter}>
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            ${doctor.price || 50}/session
          </Text>
          <TouchableOpacity
            style={[styles.bookButton, { backgroundColor: theme.colors.primary }]}
            onPress={onBook}
          >
            <Text style={styles.bookButtonText}>{t('doctors.bookSession')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Booking Modal Component
const BookingModal: React.FC<{
  visible: boolean;
  doctor: Doctor | null;
  onClose: () => void;
  onConfirm: (bookingData: any) => void;
  theme: any;
}> = ({ visible, doctor, onClose, onConfirm, theme }) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('online');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setSubmitting(true);
    try {
      await onConfirm({
        doctorId: doctor?.id,
        date: selectedDate,
        time: selectedTime,
        type: sessionType,
        notes,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!doctor) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('doctors.bookSessionWith')} Dr. {doctor.firstName}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Doctor Summary */}
            <View style={[styles.doctorSummary, { backgroundColor: theme.colors.inputBackground }]}>
              <Text style={styles.summaryEmoji}>👨‍⚕️</Text>
              <View style={styles.summaryInfo}>
                <Text style={[styles.summaryName, { color: theme.colors.text }]}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </Text>
                <Text style={[styles.summarySpec, { color: theme.colors.textSecondary }]}>
                  {doctor.specialization}
                </Text>
              </View>
            </View>

            {/* Date Selection */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t('doctors.selectDate')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.placeholder}
                value={selectedDate}
                onChangeText={setSelectedDate}
              />
            </View>

            {/* Time Selection */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t('doctors.selectTime')}
              </Text>
              <View style={styles.timeSlots}>
                {timeSlots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      {
                        backgroundColor:
                          selectedTime === time ? theme.colors.primary : theme.colors.inputBackground,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        { color: selectedTime === time ? '#FFFFFF' : theme.colors.text },
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Session Type */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t('doctors.sessionType')}
              </Text>
              <View style={styles.sessionTypes}>
                <TouchableOpacity
                  style={[
                    styles.sessionTypeOption,
                    {
                      backgroundColor:
                        sessionType === 'online' ? theme.colors.primary : theme.colors.inputBackground,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setSessionType('online')}
                >
                  <Text
                    style={[
                      styles.sessionTypeText,
                      { color: sessionType === 'online' ? '#FFFFFF' : theme.colors.text },
                    ]}
                  >
                    🖥️ {t('doctors.online')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sessionTypeOption,
                    {
                      backgroundColor:
                        sessionType === 'inPerson' ? theme.colors.primary : theme.colors.inputBackground,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setSessionType('inPerson')}
                >
                  <Text
                    style={[
                      styles.sessionTypeText,
                      { color: sessionType === 'inPerson' ? '#FFFFFF' : theme.colors.text },
                    ]}
                  >
                    🏥 {t('doctors.inPerson')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t('doctors.notesOptional')}
              </Text>
              <TextInput
                style={[
                  styles.textarea,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder={t('doctors.notesPlaceholder')}
                placeholderTextColor={theme.colors.placeholder}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Price Summary */}
            <View style={[styles.priceSummary, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
              <Text style={[styles.priceLabel, { color: '#92400E' }]}>
                {t('doctors.totalCost')}:
              </Text>
              <Text style={[styles.priceValue, { color: '#78350F' }]}>
                ${doctor.price || 50}
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.modalFooter, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleConfirm}
              disabled={submitting || !selectedDate || !selectedTime}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>{t('doctors.confirmBooking')}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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
      // Set sample data for demo
      setDoctors([
        {
          id: '1',
          firstName: 'Ahmed',
          lastName: 'Hassan',
          email: 'ahmed@example.com',
          specialization: 'Clinical Psychologist',
          experience: '10+ years',
          rating: 4.8,
          reviews: 120,
          availability: 'Mon-Fri, 9AM-5PM',
          price: '75',
          bio: 'Specialized in anxiety, depression, and cognitive behavioral therapy.',
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah@example.com',
          specialization: 'Psychiatrist',
          experience: '8 years',
          rating: 4.9,
          reviews: 95,
          availability: 'Tue-Sat, 10AM-6PM',
          price: '100',
          bio: 'Expert in mood disorders and medication management.',
        },
        {
          id: '3',
          firstName: 'Mohamed',
          lastName: 'Ali',
          email: 'mohamed@example.com',
          specialization: 'Therapist',
          experience: '5 years',
          rating: 4.6,
          reviews: 78,
          availability: 'Mon-Thu, 2PM-8PM',
          price: '60',
          bio: 'Specializes in family therapy and relationship counseling.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (bookingData: any) => {
    try {
      await doctorService.bookSession(bookingData);
      setIsBookingModalOpen(false);
      // Show success message
    } catch (err) {
      console.error('Booking error:', err);
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'highRated') return matchesSearch && (doctor.rating || 0) >= 4.5;
    if (selectedFilter === 'available') return matchesSearch && doctor.availability;
    return matchesSearch;
  });

  const filters = [
    { id: 'all', label: t('doctors.allSpecializations') },
    { id: 'highRated', label: t('doctors.highestRated') },
    { id: 'available', label: t('doctors.availableToday') },
  ];

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

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  selectedFilter === filter.id ? theme.colors.primary : theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                { color: selectedFilter === filter.id ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
            <DoctorCard doctor={item} theme={theme} onBook={() => handleBook(item)} />
          )}
          contentContainerStyle={styles.doctorList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Booking Modal */}
      <BookingModal
        visible={isBookingModalOpen}
        doctor={selectedDoctor}
        theme={theme}
        onClose={() => setIsBookingModalOpen(false)}
        onConfirm={handleConfirmBooking}
      />
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
  filtersContainer: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 14, fontWeight: '500' },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600', flex: 1 },
  closeButton: { padding: 8 },
  closeButtonText: { fontSize: 20 },
  modalBody: { padding: 16 },
  doctorSummary: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 16 },
  summaryEmoji: { fontSize: 32, marginRight: 12 },
  summaryInfo: { flex: 1 },
  summaryName: { fontSize: 16, fontWeight: '600' },
  summarySpec: { fontSize: 14 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1 },
  textarea: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1, textAlignVertical: 'top', minHeight: 80 },
  timeSlots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  timeSlotText: { fontSize: 13 },
  sessionTypes: { flexDirection: 'row', gap: 12 },
  sessionTypeOption: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  sessionTypeText: { fontSize: 14, fontWeight: '500' },
  priceSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, padding: 14, borderWidth: 1, marginTop: 8 },
  priceLabel: { fontSize: 14, fontWeight: '500' },
  priceValue: { fontSize: 20, fontWeight: 'bold' },
  modalFooter: { padding: 16, borderTopWidth: 1, gap: 12 },
  confirmButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cancelButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelButtonText: { fontSize: 16 },
});

export default DoctorsScreen;
