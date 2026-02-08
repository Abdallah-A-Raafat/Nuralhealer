import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const DoctorHomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  const stats = [
    { label: t('doctor.totalPatients'), value: '24', icon: '👥' },
    { label: t('doctor.sessionsThisWeek'), value: '12', icon: '📅' },
    { label: t('doctor.pendingNotes'), value: '3', icon: '📝' },
  ];

  const todayAppointments = [
    { id: '1', patientName: 'John Smith', time: '09:00 AM', type: 'Follow-up' },
    { id: '2', patientName: 'Emily Davis', time: '10:30 AM', type: 'Initial' },
    { id: '3', patientName: 'Michael Brown', time: '02:00 PM', type: 'Follow-up' },
  ];

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            {t('patientHome.greeting', { name: `Dr. ${user?.lastName || 'Doctor'}` })}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('doctor.dashboard')}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {stat.label}
              </Text>
            </Card>
          ))}
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('doctor.todaySchedule')}
            </Text>
            <TouchableOpacity>
              <Text style={[styles.viewAll, { color: theme.colors.primary }]}>
                View All →
              </Text>
            </TouchableOpacity>
          </View>

          {todayAppointments.length > 0 ? (
            todayAppointments.map(appointment => (
              <Card
                key={appointment.id}
                style={styles.appointmentCard}
                onPress={() => {}}
              >
                <View style={styles.appointmentInfo}>
                  <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.avatarText}>
                      {appointment.patientName.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.appointmentDetails}>
                    <Text style={[styles.patientName, { color: theme.colors.text }]}>
                      {appointment.patientName}
                    </Text>
                    <Text style={[styles.appointmentType, { color: theme.colors.textSecondary }]}>
                      {appointment.type}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.appointmentTime, { color: theme.colors.primary }]}>
                  {appointment.time}
                </Text>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {t('doctor.noAppointments')}
              </Text>
            </Card>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('doctor.recentActivity')}
          </Text>
          <Card style={styles.activityCard}>
            {[
              { action: 'Session completed with John Smith', time: '2 hours ago', icon: '✓' },
              { action: 'Notes added for Emily Davis', time: '3 hours ago', icon: '📝' },
              { action: 'New patient assigned: Michael Brown', time: '1 day ago', icon: '👤' },
            ].map((activity, index) => (
              <View
                key={index}
                style={[
                  styles.activityItem,
                  index < 2 && { borderBottomColor: theme.colors.border, borderBottomWidth: 1 },
                ]}
              >
                <Text style={styles.activityIcon}>{activity.icon}</Text>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityAction, { color: theme.colors.text }]}>
                    {activity.action}
                  </Text>
                  <Text style={[styles.activityTime, { color: theme.colors.textSecondary }]}>
                    {activity.time}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  appointmentDetails: {},
  patientName: {
    fontSize: 16,
    fontWeight: '500',
  },
  appointmentType: {
    fontSize: 13,
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
  },
  activityCard: {
    padding: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default DoctorHomeScreen;
