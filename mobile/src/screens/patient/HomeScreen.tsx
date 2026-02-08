import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import userService from '../../services/userService';
import type { PatientTabScreenProps } from '../../navigation/types';

type HomeScreenProps = PatientTabScreenProps<'Home'>;

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    voiceSessions: 0,
    textSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const userStats = await userService.getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { 
      id: 'chat', 
      title: t('patientHome.startChat'), 
      description: t('patientHome.chatDesc'),
      icon: '💬', 
      color: '#8E44AD',
      screen: 'Chat' as const
    },
    { 
      id: 'assessment', 
      title: t('patientHome.takeAssessment'), 
      description: t('patientHome.assessmentDesc'),
      icon: '📋', 
      color: '#3498DB',
      screen: 'Assessments' as const
    },
    { 
      id: 'doctors', 
      title: t('patientHome.findDoctor'), 
      description: t('patientHome.doctorDesc'),
      icon: '👨‍⚕️', 
      color: '#27AE60',
      screen: 'Doctors' as const
    },
    { 
      id: 'profile', 
      title: t('patientHome.viewProfile'), 
      description: t('patientHome.profileDesc'),
      icon: '👤', 
      color: '#E67E22',
      screen: 'Profile' as const
    },
  ];

  const statsCards = [
    {
      label: t('patientHome.totalSessions'),
      value: stats.totalSessions,
      icon: '📊',
      color: '#8E44AD',
    },
    {
      label: t('patientHome.totalMinutes'),
      value: stats.totalMinutes,
      icon: '⏱️',
      color: '#3498DB',
    },
    {
      label: t('patientHome.voiceSessions'),
      value: stats.voiceSessions,
      icon: '🎤',
      color: '#27AE60',
    },
    {
      label: t('patientHome.textSessions'),
      value: stats.textSessions,
      icon: '💬',
      color: '#E67E22',
    },
  ];

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            {t('patientHome.greeting', { name: user?.firstName || 'User' })}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('patientHome.howAreYou')}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            statsCards.map((stat, index) => (
              <Card key={index} style={styles.statCard} elevated>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </Card>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('patientHome.quickActions')}
        </Text>
        <View style={styles.actionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                {action.title}
              </Text>
              <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>
                {action.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Tip */}
        <Card style={styles.tipCard}>
          <Text style={[styles.tipTitle, { color: theme.colors.primary }]}>
            💡 {t('patientHome.dailyTip')}
          </Text>
          <Text style={[styles.tipText, { color: theme.colors.text }]}>
            {t('patientHome.tipText')}
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
  statsContainer: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
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
  actionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDescription: {
    flex: 1,
    fontSize: 13,
  },
  tipCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
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

export default HomeScreen;
