import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import engagementService from '../../services/engagementService';
import type { DoctorTabScreenProps } from '../../navigation/types';

type DoctorProfileScreenProps = DoctorTabScreenProps<'DoctorProfile'>;

const DoctorProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<DoctorProfileScreenProps['navigation']>();
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeEngagements: 0,
    pendingRequests: 0,
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
        activeEngagements: engagements.filter(e => e.status === 'active').length,
        pendingRequests: engagements.filter(e => e.status === 'pending').length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const menuItems = [
    {
      title: t('profile.editProfile'),
      icon: '✏️',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      title: t('nav.settings'),
      icon: '⚙️',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      title: t('profile.notifications'),
      icon: '🔔',
      onPress: () => {},
    },
    {
      title: t('doctor.availability'),
      icon: '📅',
      onPress: () => {},
    },
    {
      title: t('profile.help'),
      icon: '❓',
      onPress: () => {},
    },
    {
      title: t('profile.privacy'),
      icon: '🔒',
      onPress: () => {},
    },
  ];

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card style={styles.profileCard} elevated>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            Dr. {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
            {user?.email}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.roleText, { color: theme.colors.primary }]}>
              {t('doctor.psychiatrist')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.editButton, { borderColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={[styles.editButtonText, { color: theme.colors.primary }]}>
              {t('profile.editProfile')}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Stats */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stats.totalPatients}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {t('doctor.patients')}
              </Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stats.activeEngagements}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {t('doctor.active')}
              </Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stats.pendingRequests}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                {t('doctor.pending')}
              </Text>
            </Card>
          </View>
        )}

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                },
              ]}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuText, { color: theme.colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>
                →
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.error + '15' }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>
            {t('auth.logout')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  menuCard: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  menuArrow: {
    fontSize: 20,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DoctorProfileScreen;
