import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ScreenWrapper, Card, Button } from '../../components/common';
import { useThemeStore } from '../../store/themeStore';
import type { DoctorStackParamList, DoctorStackScreenProps } from '../../navigation/types';

type PatientDetailScreenProps = DoctorStackScreenProps<'PatientDetail'>;
type PatientDetailRouteProp = RouteProp<DoctorStackParamList, 'PatientDetail'>;

const PatientDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<PatientDetailScreenProps['navigation']>();
  const route = useRoute<PatientDetailRouteProp>();
  const { theme } = useThemeStore();

  const { patientId } = route.params;

  // Mock patient data - would be fetched based on patientId
  const patient = {
    id: patientId,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 234 567 8900',
    age: 32,
    gender: 'Male',
    joinDate: 'Dec 1, 2023',
    lastSession: 'Jan 15, 2024',
    nextSession: 'Jan 22, 2024',
    totalSessions: 8,
    assessments: [
      { name: 'Depression (PHQ-9)', score: 12, date: 'Jan 10, 2024', status: 'moderate' },
      { name: 'Anxiety (GAD-7)', score: 8, date: 'Jan 10, 2024', status: 'mild' },
    ],
    notes: 'Patient shows improvement in anxiety symptoms. Continue current treatment plan.',
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
            {t('doctor.patientDetails')}
          </Text>
        </View>

        {/* Patient Info Card */}
        <Card style={styles.infoCard} elevated>
          <View style={styles.patientHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>
                {patient.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={[styles.patientName, { color: theme.colors.text }]}>
                {patient.name}
              </Text>
              <Text style={[styles.patientEmail, { color: theme.colors.textSecondary }]}>
                {patient.email}
              </Text>
            </View>
          </View>

          <View style={[styles.detailsGrid, { borderTopColor: theme.colors.border }]}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Age</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>{patient.age}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Gender</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>{patient.gender}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Sessions</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>{patient.totalSessions}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Since</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>{patient.joinDate}</Text>
            </View>
          </View>
        </Card>

        {/* Sessions Info */}
        <Card style={styles.sessionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Session Information
          </Text>
          <View style={styles.sessionInfo}>
            <View style={styles.sessionItem}>
              <Text style={[styles.sessionLabel, { color: theme.colors.textSecondary }]}>
                {t('doctor.lastSession')}
              </Text>
              <Text style={[styles.sessionValue, { color: theme.colors.text }]}>
                {patient.lastSession}
              </Text>
            </View>
            <View style={styles.sessionItem}>
              <Text style={[styles.sessionLabel, { color: theme.colors.textSecondary }]}>
                {t('doctor.nextSession')}
              </Text>
              <Text style={[styles.sessionValue, { color: theme.colors.primary }]}>
                {patient.nextSession}
              </Text>
            </View>
          </View>
        </Card>

        {/* Assessments */}
        <Card style={styles.assessmentsCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recent Assessments
          </Text>
          {patient.assessments.map((assessment, index) => (
            <View
              key={index}
              style={[
                styles.assessmentItem,
                { borderBottomColor: theme.colors.border },
                index === patient.assessments.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.assessmentInfo}>
                <Text style={[styles.assessmentName, { color: theme.colors.text }]}>
                  {assessment.name}
                </Text>
                <Text style={[styles.assessmentDate, { color: theme.colors.textSecondary }]}>
                  {assessment.date}
                </Text>
              </View>
              <View style={styles.assessmentScore}>
                <Text style={[styles.scoreValue, { color: theme.colors.text }]}>
                  {assessment.score}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        assessment.status === 'mild'
                          ? theme.colors.success + '20'
                          : assessment.status === 'moderate'
                          ? theme.colors.warning + '20'
                          : theme.colors.error + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          assessment.status === 'mild'
                            ? theme.colors.success
                            : assessment.status === 'moderate'
                            ? theme.colors.warning
                            : theme.colors.error,
                      },
                    ]}
                  >
                    {assessment.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* Notes */}
        <Card style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('doctor.sessionNotes')}
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('SessionNotes', { sessionId: '1', patientId: patient.id })
              }
            >
              <Text style={[styles.addNotesLink, { color: theme.colors.primary }]}>
                {t('doctor.addNotes')} →
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>
            {patient.notes}
          </Text>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Schedule Session"
            onPress={() => {}}
            style={styles.actionButton}
          />
          <Button
            title={t('doctor.viewHistory')}
            onPress={() => {}}
            variant="outline"
            style={styles.actionButton}
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
  infoCard: {
    marginBottom: 16,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  patientInfo: {},
  patientName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  patientEmail: {
    fontSize: 14,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  sessionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sessionInfo: {
    flexDirection: 'row',
    gap: 24,
  },
  sessionItem: {},
  sessionLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  sessionValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  assessmentsCard: {
    marginBottom: 16,
  },
  assessmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  assessmentInfo: {},
  assessmentName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  assessmentDate: {
    fontSize: 12,
  },
  assessmentScore: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  notesCard: {
    marginBottom: 24,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addNotesLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {},
});

export default PatientDetailScreen;
