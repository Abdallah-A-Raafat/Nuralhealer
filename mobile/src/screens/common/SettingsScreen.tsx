import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card } from '../../components/common';
import { useThemeStore } from '../../store/themeStore';
import { changeLanguage, getCurrentLanguage } from '../../i18n';

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { mode, setMode, theme } = useThemeStore();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

  const handleLanguageChange = async (lang: 'en' | 'ar') => {
    await changeLanguage(lang);
    setCurrentLanguage(lang);
    Alert.alert(
      'Language Changed',
      'Please restart the app for the changes to take full effect.'
    );
  };

  const themeOptions = [
    { value: 'light', label: t('profile.lightMode') },
    { value: 'dark', label: t('profile.darkMode') },
    { value: 'system', label: t('profile.systemDefault') },
  ];

  const languageOptions = [
    { value: 'en', label: t('settings.english') },
    { value: 'ar', label: t('settings.arabic') },
  ];

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
            {t('settings.title')}
          </Text>
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('settings.appearance')}
        </Text>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {t('profile.theme')}
          </Text>
          <View style={styles.optionsContainer}>
            {themeOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border },
                  mode === option.value && { borderColor: theme.colors.primary, borderWidth: 2 },
                ]}
                onPress={() => setMode(option.value as 'light' | 'dark' | 'system')}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: mode === option.value ? theme.colors.primary : theme.colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Language */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('settings.language')}
        </Text>
        <Card style={styles.card}>
          <View style={styles.optionsContainer}>
            {languageOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border },
                  currentLanguage === option.value && { borderColor: theme.colors.primary, borderWidth: 2 },
                ]}
                onPress={() => handleLanguageChange(option.value as 'en' | 'ar')}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: currentLanguage === option.value ? theme.colors.primary : theme.colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Notifications */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('settings.notifications')}
        </Text>
        <Card style={styles.card}>
          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {t('settings.pushNotifications')}
            </Text>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
              thumbColor={pushNotifications ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {t('settings.emailNotifications')}
            </Text>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
              thumbColor={emailNotifications ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          <View style={styles.settingItemLast}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {t('settings.reminderNotifications')}
            </Text>
            <Switch
              value={sessionReminders}
              onValueChange={setSessionReminders}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
              thumbColor={sessionReminders ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
        </Card>

        {/* Security */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('settings.security')}
        </Text>
        <Card style={styles.card}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.menuText, { color: theme.colors.text }]}>
              {t('settings.changePassword')}
            </Text>
            <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItemLast}>
            <Text style={[styles.menuText, { color: theme.colors.text }]}>
              {t('settings.biometrics')}
            </Text>
            <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>→</Text>
          </TouchableOpacity>
        </Card>

        {/* Data & Privacy */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('settings.dataPrivacy')}
        </Text>
        <Card style={styles.card}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.menuText, { color: theme.colors.text }]}>
              {t('settings.exportData')}
            </Text>
            <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItemLast}>
            <Text style={[styles.menuText, { color: theme.colors.error }]}>
              {t('settings.clearData')}
            </Text>
            <Text style={[styles.menuArrow, { color: theme.colors.error }]}>→</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.spacer} />
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
    padding: 0,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    padding: 16,
    paddingBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingItemLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuItemLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
  },
  menuArrow: {
    fontSize: 18,
  },
  spacer: {
    height: 32,
  },
});

export default SettingsScreen;
