import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card, Button } from '../../components/common';
import { useThemeStore } from '../../store/themeStore';
import type { PatientStackScreenProps } from '../../navigation/types';

type BookingScreenProps = PatientStackScreenProps<'Booking'>;

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  avatar: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

const BookingScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<BookingScreenProps['navigation']>();
  const { theme } = useThemeStore();

  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const doctors: Doctor[] = [
    { id: '1', name: 'Dr. Sarah Johnson', specialty: 'Psychiatrist', rating: 4.8, avatar: '👩‍⚕️' },
    { id: '2', name: 'Dr. Michael Chen', specialty: 'Psychologist', rating: 4.9, avatar: '👨‍⚕️' },
    { id: '3', name: 'Dr. Emily Brown', specialty: 'Therapist', rating: 4.7, avatar: '👩‍⚕️' },
  ];

  const dates = [
    { id: '1', day: 'Mon', date: '15', month: 'Jan' },
    { id: '2', day: 'Tue', date: '16', month: 'Jan' },
    { id: '3', day: 'Wed', date: '17', month: 'Jan' },
    { id: '4', day: 'Thu', date: '18', month: 'Jan' },
    { id: '5', day: 'Fri', date: '19', month: 'Jan' },
  ];

  const timeSlots: TimeSlot[] = [
    { id: '1', time: '09:00 AM', available: true },
    { id: '2', time: '10:00 AM', available: true },
    { id: '3', time: '11:00 AM', available: false },
    { id: '4', time: '02:00 PM', available: true },
    { id: '5', time: '03:00 PM', available: true },
    { id: '6', time: '04:00 PM', available: false },
  ];

  const handleConfirmBooking = () => {
    // Handle booking confirmation
    navigation.goBack();
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.colors.primary }]}>
              ← {t('common.back')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('booking.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('booking.subtitle')}
          </Text>
        </View>

        {/* Select Doctor */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('booking.selectDoctor')}
          </Text>
          {doctors.map(doctor => (
            <Card
              key={doctor.id}
              style={[
                styles.doctorCard,
                selectedDoctor === doctor.id && {
                  borderColor: theme.colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedDoctor(doctor.id)}
            >
              <Text style={styles.doctorAvatar}>{doctor.avatar}</Text>
              <View style={styles.doctorInfo}>
                <Text style={[styles.doctorName, { color: theme.colors.text }]}>
                  {doctor.name}
                </Text>
                <Text style={[styles.doctorSpecialty, { color: theme.colors.textSecondary }]}>
                  {doctor.specialty}
                </Text>
              </View>
              <Text style={[styles.rating, { color: theme.colors.warning }]}>
                ⭐ {doctor.rating}
              </Text>
            </Card>
          ))}
        </View>

        {/* Select Date */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('booking.selectDate')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.datesContainer}>
              {dates.map(date => (
                <TouchableOpacity
                  key={date.id}
                  style={[
                    styles.dateCard,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                    selectedDate === date.id && {
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedDate(date.id)}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      { color: selectedDate === date.id ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                  >
                    {date.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumber,
                      { color: selectedDate === date.id ? '#FFFFFF' : theme.colors.text },
                    ]}
                  >
                    {date.date}
                  </Text>
                  <Text
                    style={[
                      styles.dateMonth,
                      { color: selectedDate === date.id ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                  >
                    {date.month}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Select Time */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('booking.selectTime')}
          </Text>
          <View style={styles.timeSlotsContainer}>
            {timeSlots.map(slot => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  {
                    backgroundColor: slot.available ? theme.colors.card : theme.colors.border,
                    borderColor: theme.colors.border,
                  },
                  selectedTime === slot.id && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => slot.available && setSelectedTime(slot.id)}
                disabled={!slot.available}
              >
                <Text
                  style={[
                    styles.timeText,
                    {
                      color: !slot.available
                        ? theme.colors.textSecondary
                        : selectedTime === slot.id
                        ? '#FFFFFF'
                        : theme.colors.text,
                    },
                  ]}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Confirm Button */}
        <Button
          title={t('booking.confirmBooking')}
          onPress={handleConfirmBooking}
          disabled={!selectedDoctor || !selectedDate || !selectedTime}
          style={styles.confirmButton}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
  },
  doctorAvatar: {
    fontSize: 40,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  doctorSpecialty: {
    fontSize: 14,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCard: {
    width: 70,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  dateDay: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateMonth: {
    fontSize: 12,
    marginTop: 4,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    marginBottom: 32,
  },
});

export default BookingScreen;
