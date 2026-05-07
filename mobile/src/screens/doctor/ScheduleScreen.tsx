import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper, Card } from '../../components/common';
import { useThemeStore } from '../../store/themeStore';
import engagementService from '../../services/engagementService';

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEngagementAppointments = async () => {
      try {
        setLoading(true);
        const engagements = await engagementService.getMyEngagements();
        const mapped: Appointment[] = (engagements || [])
          .filter((engagement: any) => ['active', 'pending'].includes((engagement.status || '').toLowerCase()))
          .map((engagement: any) => {
            const patient = engagement.patient || {};
            const patientName = [patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Patient';
            const createdAt = engagement.createdAt || engagement.startDate || new Date().toISOString();
            const time = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return {
              id: engagement.id,
              patientName,
              time,
              duration: '50 min',
              type: 'online',
              status: (engagement.status || '').toLowerCase() === 'active' ? 'confirmed' : 'pending',
            };
          });

        setAppointments(mapped);
      } catch (error) {
        console.error('Failed to load schedule data:', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadEngagementAppointments();
  }, []);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('nav.schedule')}
        </Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <Text style={[styles.appointmentsCount, { color: theme.colors.textSecondary }]}> 
            {appointments.length} appointments
          </Text>
        )}

        {!loading && appointments.length > 0 ? (
          appointments.map(appointment => (
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
        ) : !loading ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No appointments scheduled
            </Text>
          </Card>
        ) : null}
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
