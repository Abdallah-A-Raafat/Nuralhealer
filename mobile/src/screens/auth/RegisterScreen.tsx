import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Input, Button, Card } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { authService } from '../../services/authService';
import type { AuthStackScreenProps } from '../../navigation/types';

type RegisterScreenProps = AuthStackScreenProps<'Register'>;

const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<RegisterScreenProps['navigation']>();
  const { login } = useAuthStore();
  const { theme } = useThemeStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = t('common.required');
    }
    if (!lastName.trim()) {
      newErrors.lastName = t('common.required');
    }
    if (!email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.invalidEmail');
    }
    if (!password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (password.length < 8) {
      newErrors.password = t('auth.passwordTooShort');
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsNoMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.register({
        email,
        password,
        firstName,
        lastName,
        role: role.toUpperCase() as 'DOCTOR' | 'PATIENT',
      });
      
      // Handle response
      const userData = response.user || response;
      const token = response.token || 'session-token';
      
      login(
        {
          userId: userData.userId || userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role?.toUpperCase() as 'DOCTOR' | 'PATIENT',
        },
        token
      );
    } catch (error: any) {
      console.log('Registration error:', error);
      setErrors({ email: error.message || t('errors.generic') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.appName, { color: theme.colors.primary }]}>
              NeuralHealer
            </Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t('auth.createAccount')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t('auth.registerSubtitle')}
            </Text>
          </View>

          <Card style={styles.formCard}>
            {/* Role Selection */}
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('auth.selectRole')}
            </Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  {
                    backgroundColor: role === 'patient' ? theme.colors.primary : theme.colors.inputBackground,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setRole('patient')}
              >
                <Text
                  style={[
                    styles.roleText,
                    { color: role === 'patient' ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {t('auth.patient')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  {
                    backgroundColor: role === 'doctor' ? theme.colors.primary : theme.colors.inputBackground,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setRole('doctor')}
              >
                <Text
                  style={[
                    styles.roleText,
                    { color: role === 'doctor' ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {t('auth.doctor')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.nameRow}>
              <View style={styles.nameInput}>
                <Input
                  label={t('auth.firstName')}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="John"
                  error={errors.firstName}
                />
              </View>
              <View style={styles.nameInput}>
                <Input
                  label={t('auth.lastName')}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
                  error={errors.lastName}
                />
              </View>
            </View>

            <Input
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              error={errors.password}
            />

            <Input
              label={t('auth.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title={t('auth.register')}
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
            />
          </Card>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              {t('auth.hasAccount')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.signInText, { color: theme.colors.primary }]}>
                {' '}{t('auth.signIn')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  signInText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
