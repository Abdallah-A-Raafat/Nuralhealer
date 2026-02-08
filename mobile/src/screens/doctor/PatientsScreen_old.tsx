import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card } from '../../components/common';
import { useThemeStore } from '../../store/themeStore';
import type { DoctorTabScreenProps } from '../../navigation/types';

type PatientsScreenProps = DoctorTabScreenProps<'Patients'>;

interface Patient {
  id: string;
  name: string;
  lastSession: string;
  nextSession?: string;
  status: 'active' | 'inactive';
  assessments: number;
}

const PatientsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<PatientsScreenProps['navigation']>();
  const { theme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');

  const patients: Patient[] = [
    { id: '1', name: 'John Smith', lastSession: 'Jan 15, 2024', nextSession: 'Jan 22, 2024', status: 'active', assessments: 4 },
    { id: '2', name: 'Emily Davis', lastSession: 'Jan 14, 2024', nextSession: 'Jan 21, 2024', status: 'active', assessments: 3 },
    { id: '3', name: 'Michael Brown', lastSession: 'Jan 10, 2024', status: 'active', assessments: 2 },
    { id: '4', name: 'Sarah Wilson', lastSession: 'Dec 20, 2023', status: 'inactive', assessments: 5 },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('doctor.myPatients')}
        </Text>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder={t('common.search')}
            placeholderTextColor={theme.colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <Card
              key={patient.id}
              style={styles.patientCard}
              onPress={() => navigation.navigate('PatientDetail', { patientId: patient.id })}
            >
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
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          patient.status === 'active'
                            ? theme.colors.success + '20'
                            : theme.colors.textSecondary + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            patient.status === 'active'
                              ? theme.colors.success
                              : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {patient.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>→</Text>
              </View>

              <View style={[styles.patientDetails, { borderTopColor: theme.colors.border }]}>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    {t('doctor.lastSession')}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {patient.lastSession}
                  </Text>
                </View>
                {patient.nextSession && (
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                      {t('doctor.nextSession')}
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                      {patient.nextSession}
                    </Text>
                  </View>
                )}
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    Assessments
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {patient.assessments}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? t('common.noResults') : t('doctor.noPatients')}
            </Text>
          </Card>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  patientCard: {
    marginBottom: 16,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
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
    textTransform: 'capitalize',
  },
  arrow: {
    fontSize: 20,
  },
  patientDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 16,
  },
  detailItem: {
    minWidth: '30%',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
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

export default PatientsScreen;
