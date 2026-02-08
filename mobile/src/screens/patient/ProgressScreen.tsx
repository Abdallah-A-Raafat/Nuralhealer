import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper, Card } from '../../components/common';
import { useThemeStore } from '../../store/themeStore';

const { width } = Dimensions.get('window');

type TimeFilter = 'week' | 'month' | 'all';

const ProgressScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');

  const moodData = [
    { day: 'Mon', value: 3, emoji: '😐' },
    { day: 'Tue', value: 4, emoji: '🙂' },
    { day: 'Wed', value: 2, emoji: '😕' },
    { day: 'Thu', value: 4, emoji: '🙂' },
    { day: 'Fri', value: 5, emoji: '😊' },
    { day: 'Sat', value: 4, emoji: '🙂' },
    { day: 'Sun', value: 4, emoji: '🙂' },
  ];

  const insights = [
    { label: 'Average Mood', value: '3.7/5', icon: '😊', trend: 'up' },
    { label: 'Chat Sessions', value: '12', icon: '💬', trend: 'up' },
    { label: 'Assessments', value: '4', icon: '📋', trend: 'stable' },
  ];

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('progress.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('progress.subtitle')}
          </Text>
        </View>

        {/* Time Filter */}
        <View style={[styles.filterContainer, { backgroundColor: theme.colors.card }]}>
          {(['week', 'month', 'all'] as TimeFilter[]).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                timeFilter === filter && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setTimeFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: timeFilter === filter ? '#FFFFFF' : theme.colors.textSecondary,
                  },
                ]}
              >
                {t(`progress.${filter === 'week' ? 'thisWeek' : filter === 'month' ? 'thisMonth' : 'allTime'}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Insights Cards */}
        <View style={styles.insightsContainer}>
          {insights.map((insight, index) => (
            <Card key={index} style={styles.insightCard}>
              <Text style={styles.insightIcon}>{insight.icon}</Text>
              <Text style={[styles.insightValue, { color: theme.colors.text }]}>
                {insight.value}
              </Text>
              <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>
                {insight.label}
              </Text>
              <Text style={styles.trendIcon}>
                {insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '→'}
              </Text>
            </Card>
          ))}
        </View>

        {/* Mood History */}
        <Card style={styles.chartCard} elevated>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('progress.moodHistory')}
          </Text>
          <View style={styles.chartContainer}>
            {moodData.map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <Text style={styles.barEmoji}>{item.emoji}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (item.value / 5) * 80,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
                <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>
                  {item.day}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recent Activity
          </Text>
          {[
            { date: 'Today', action: 'Completed mood check-in', icon: '✓' },
            { date: 'Yesterday', action: 'Chat session (15 min)', icon: '💬' },
            { date: '2 days ago', action: 'Anxiety assessment completed', icon: '📋' },
          ].map((activity, index) => (
            <View
              key={index}
              style={[styles.activityItem, { borderBottomColor: theme.colors.border }]}
            >
              <Text style={styles.activityIcon}>{activity.icon}</Text>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityAction, { color: theme.colors.text }]}>
                  {activity.action}
                </Text>
                <Text style={[styles.activityDate, { color: theme.colors.textSecondary }]}>
                  {activity.date}
                </Text>
              </View>
            </View>
          ))}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  insightsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  insightCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  insightIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  insightLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  trendIcon: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 4,
  },
  chartCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  bar: {
    width: 24,
    borderRadius: 12,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  activityCard: {
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default ProgressScreen;
