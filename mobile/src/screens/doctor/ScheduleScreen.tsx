import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper, Card } from '../../components/common';
import { useThemeStore } from '../../store/themeStore';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  duration: string;
  type: 'online' | 'in-person';
  status: 'confirmed' | 'pending';
}

const ScheduleScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  const [selectedDate, setSelectedDate] = useState<string>('today');

  const dates = [
    { id: 'today', label: 'Today', date: 'Jan 17' },
    { id: 'tomorrow', label: 'Tomorrow', date: 'Jan 18' },
    { id: 'day3', label: 'Fri', date: 'Jan 19' },
    { id: 'day4', label: 'Sat', date: 'Jan 20' },
    { id: 'day5', label: 'Sun', date: 'Jan 21' },
  ];

  const appointments: Record<string, Appointment[]> = {
    today: [
      { id: '1', patientName: 'John Smith', time: '09:00 AM', duration: '50 min', type: 'online', status: 'confirmed' },
      { id: '2', patientName: 'Emily Davis', time: '10:30 AM', duration: '50 min', type: 'in-person', status: 'confirmed' },
      { id: '3', patientName: 'Michael Brown', time: '02:00 PM', duration: '50 min', type: 'online', status: 'pending' },
    ],
    tomorrow: [
      { id: '4', patientName: 'Sarah Wilson', time: '11:00 AM', duration: '50 min', type: 'online', status: 'confirmed' },
      { id: '5', patientName: 'James Taylor', time: '03:00 PM', duration: '50 min', type: 'in-person', status: 'confirmed' },
    ],
    day3: [],
    day4: [],
    day5: [],
  };

  const currentAppointments = appointments[selectedDate] || [];

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('nav.schedule')}
        </Text>
      </View>

      {/* Date Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateSelector}
        contentContainerStyle={styles.dateSelectorContent}
      >
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
                styles.dateLabel,
                { color: selectedDate === date.id ? '#FFFFFF' : theme.colors.textSecondary },
              ]}
            >
              {date.label}
            </Text>
            <Text
              style={[
                styles.dateText,
                { color: selectedDate === date.id ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              {date.date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.appointmentsCount, { color: theme.colors.textSecondary }]}>
          {currentAppointments.length} appointments
        </Text>

        {currentAppointments.length > 0 ? (
          currentAppointments.map(appointment => (
            <Card key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.timeContainer}>
                  <Text style={[styles.time, { color: theme.colors.primary }]}>
                    {appointment.time}
                  </Text>
                  <Text style={[styles.duration, { color: theme.colors.textSecondary }]}>
                    {appointment.duration}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        appointment.status === 'confirmed'
                          ? theme.colors.success + '20'
                          : theme.colors.warning + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          appointment.status === 'confirmed'
                            ? theme.colors.success
                            : theme.colors.warning,
                      },
                    ]}
                  >
                    {appointment.status}
                  </Text>
                </View>
              </View>

              <View style={styles.patientInfo}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {appointment.patientName.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.patientName, { color: theme.colors.text }]}>
                    {appointment.patientName}
                  </Text>
                  <Text style={[styles.appointmentType, { color: theme.colors.textSecondary }]}>
                    {appointment.type === 'online' ? '💻 Online' : '🏥 In-person'}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={styles.actionButtonText}>Start Session</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButtonOutline, { borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.actionButtonOutlineText, { color: theme.colors.text }]}>
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No appointments scheduled
            </Text>
          </Card>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  dateSelector: {
    maxHeight: 80,
  },
  dateSelectorContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dateCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 70,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  appointmentsCount: {
    fontSize: 14,
    marginBottom: 16,
  },
  appointmentCard: {
    marginBottom: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeContainer: {},
  time: {
    fontSize: 18,
    fontWeight: '600',
  },
  duration: {
    fontSize: 13,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
  },
  appointmentType: {
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtonOutline: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonOutlineText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default ScheduleScreen;
