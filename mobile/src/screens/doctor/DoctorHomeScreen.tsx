import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import engagementService from '../../services/engagementService';
import type { DoctorTabScreenProps } from '../../navigation/types';

type DoctorHomeScreenProps = DoctorTabScreenProps<'DoctorHome'>;

const DoctorHomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<DoctorHomeScreenProps['navigation']>();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingRequests: 0,
    activeEngagements: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const engagements = await engagementService.getMyEngagements();
      
      setStats({
        totalPatients: engagements.length,
        pendingRequests: engagements.filter(e => e.status === 'pending').length,
        activeEngagements: engagements.filter(e => e.status === 'active').length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { 
      label: t('doctor.totalPatients'), 
      value: stats.totalPatients.toString(), 
      icon: '👥',
      color: theme.colors.primary,
    },
    { 
      label: t('doctor.pendingRequests'), 
      value: stats.pendingRequests.toString(), 
      icon: '⏳',
      color: '#F59E0B',
    },
    { 
      label: t('doctor.activeEngagements'), 
      value: stats.activeEngagements.toString(), 
      icon: '✓',
      color: '#22C55E',
    },
  ];

  const quickActions = [
    {
      title: t('doctor.myPatients'),
      description: t('doctor.managePatientsDesc'),
      icon: '👥',
      color: '#3B82F6',
      onPress: () => navigation.navigate('Patients'),
    },
    {
      title: t('doctor.schedule'),
      description: t('doctor.scheduleDesc'),
      icon: '📅',
      color: '#8B5CF6',
      onPress: () => navigation.navigate('Schedule'),
    },
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            {statsCards.map((stat, index) => (
              <Card key={index} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('doctor.quickActions')}
          </Text>
          
          {quickActions.map((action, index) => (
            <Card
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                  {action.title}
                </Text>
                <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>
                  {action.description}
                </Text>
              </View>
              <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>→</Text>
            </Card>
          ))}
        </View>

        {/* Tip Card */}
        <Card style={styles.tipCard}>
          <Text style={[styles.tipTitle, { color: theme.colors.primary }]}>
            💡 {t('doctor.profTip')}
          </Text>
          <Text style={[styles.tipText, { color: theme.colors.text }]}>
            {t('doctor.tipText')}
          </Text>
        </Card>
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
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
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 20,
    marginLeft: 8,
  },
  tipCard: {
    padding: 16,
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default DoctorHomeScreen;
