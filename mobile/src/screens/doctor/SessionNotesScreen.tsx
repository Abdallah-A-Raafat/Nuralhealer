import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ScreenWrapper, Card, Button } from '../../components/common';
import { useThemeStore } from '../../store/themeStore';
import type { DoctorStackParamList, DoctorStackScreenProps } from '../../navigation/types';

type SessionNotesScreenProps = DoctorStackScreenProps<'SessionNotes'>;
type SessionNotesRouteProp = RouteProp<DoctorStackParamList, 'SessionNotes'>;

const SessionNotesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<SessionNotesScreenProps['navigation']>();
  const route = useRoute<SessionNotesRouteProp>();
  const { theme } = useThemeStore();

  const { sessionId, patientId } = route.params;

  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState('');
  const [progress, setProgress] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock session data
  const session = {
    patientName: 'John Smith',
    date: 'Jan 15, 2024',
    time: '10:00 AM',
    duration: '50 min',
    type: 'Follow-up',
  };

  const handleSave = async () => {
    if (!notes.trim()) {
      Alert.alert('Error', 'Please enter session notes');
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert(t('success.notesSaved'), '', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', t('errors.generic'));
    } finally {
      setIsLoading(false);
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
            {t('doctor.sessionNotes')}
          </Text>
        </View>

        {/* Session Info */}
        <Card style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>
                {session.patientName.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.sessionInfo}>
              <Text style={[styles.patientName, { color: theme.colors.text }]}>
                {session.patientName}
              </Text>
              <Text style={[styles.sessionDetails, { color: theme.colors.textSecondary }]}>
                {session.date} • {session.time} • {session.duration}
              </Text>
              <View style={[styles.typeBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.typeText, { color: theme.colors.primary }]}>
                  {session.type}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Notes Form */}
        <View style={styles.form}>
          {/* Patient Mood */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Patient's Mood / Mental State
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text,
                },
              ]}
              value={mood}
              onChangeText={setMood}
              placeholder="How was the patient feeling today?"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          {/* Session Notes */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Session Notes *
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Detailed notes about the session..."
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Progress */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Progress Observations
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text,
                  minHeight: 80,
                },
              ]}
              value={progress}
              onChangeText={setProgress}
              placeholder="Any improvements or concerns..."
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Next Steps */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Next Steps / Recommendations
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text,
                  minHeight: 80,
                },
              ]}
              value={nextSteps}
              onChangeText={setNextSteps}
              placeholder="Treatment adjustments, homework, etc..."
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={t('common.save')}
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
          />
          <Button
            title={t('common.cancel')}
            onPress={() => navigation.goBack()}
            variant="outline"
          />
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
    marginBottom: 24,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sessionInfo: {},
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionDetails: {
    fontSize: 13,
    marginBottom: 8,
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  form: {},
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 120,
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  saveButton: {},
});

export default SessionNotesScreen;
