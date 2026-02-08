import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card } from '../../components/common';
import { useThemeStore } from '../../store/themeStore';

interface Session {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  duration: string;
  type: 'online' | 'in-person';
  status: 'upcoming' | 'completed' | 'cancelled';
}

const SessionHistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useThemeStore();

  const sessions: Session[] = [
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      date: 'Jan 20, 2024',
      time: '10:00 AM',
      duration: '50 min',
      type: 'online',
      status: 'upcoming',
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      date: 'Jan 15, 2024',
      time: '02:00 PM',
      duration: '50 min',
      type: 'in-person',
      status: 'completed',
    },
    {
      id: '3',
      doctorName: 'Dr. Sarah Johnson',
      date: 'Jan 10, 2024',
      time: '11:00 AM',
      duration: '50 min',
      type: 'online',
      status: 'completed',
    },
  ];

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'upcoming':
        return theme.colors.primary;
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: Session['status']) => {
    switch (status) {
      case 'upcoming':
        return t('booking.upcomingSession');
      case 'completed':
        return t('booking.pastSession');
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
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
            {t('booking.sessionHistory')}
          </Text>
        </View>

        {/* Sessions List */}
        {sessions.length > 0 ? (
          sessions.map(session => (
            <Card key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorAvatar}>👨‍⚕️</Text>
                  <View>
                    <Text style={[styles.doctorName, { color: theme.colors.text }]}>
                      {session.doctorName}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(session.status) + '20' },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: getStatusColor(session.status) }]}>
                        {getStatusText(session.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.sessionDetails, { borderTopColor: theme.colors.border }]}>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    📅 {t('booking.date')}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {session.date}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    ⏰ {t('booking.time')}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {session.time}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    ⏱️ {t('booking.duration')}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {session.duration}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    📍 {t('booking.type')}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {session.type === 'online' ? t('booking.online') : t('booking.inPerson')}
                  </Text>
                </View>
              </View>

              {session.status === 'upcoming' && (
                <View style={styles.sessionActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: theme.colors.error }]}
                  >
                    <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                      {t('booking.cancelBooking')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: theme.colors.primary }]}
                  >
                    <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                      {t('booking.reschedule')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('booking.noSessionHistory')}
            </Text>
          </Card>
        )}
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
  },
  sessionCard: {
    marginBottom: 16,
  },
  sessionHeader: {
    marginBottom: 12,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    fontSize: 40,
    marginRight: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sessionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 16,
  },
  detailItem: {
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default SessionHistoryScreen;
