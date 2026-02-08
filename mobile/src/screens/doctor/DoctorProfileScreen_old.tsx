import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import type { DoctorTabScreenProps } from '../../navigation/types';

type DoctorProfileScreenProps = DoctorTabScreenProps<'DoctorProfile'>;

const DoctorProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<DoctorProfileScreenProps['navigation']>();
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();

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
      title: 'Availability',
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
          <View style={[styles.specialtyBadge, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.specialtyText, { color: theme.colors.primary }]}>
              Psychiatrist
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
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>24</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Patients
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>156</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Sessions
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>4.9</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Rating
            </Text>
          </Card>
        </View>

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

        {/* Version */}
        <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
          {t('profile.version')} 1.0.0
        </Text>
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
    marginBottom: 16,
    paddingVertical: 24,
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 12,
  },
  specialtyBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  menuCard: {
    marginBottom: 24,
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  menuArrow: {
    fontSize: 18,
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 24,
  },
});

export default DoctorProfileScreen;
