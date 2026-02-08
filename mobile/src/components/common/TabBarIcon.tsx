import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TabBarIconProps {
  name: string;
  color: string;
  size: number;
}

// Simple icon component using text/emoji
// In production, you would use a proper icon library like react-native-vector-icons
const iconMap: Record<string, string> = {
  home: '🏠',
  'chatbubble-ellipses': '💬',
  clipboard: '📋',
  'trending-up': '📈',
  person: '👤',
  people: '👥',
  calendar: '📅',
  settings: '⚙️',
};

export const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color, size }) => {
  const icon = iconMap[name] || '●';

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { fontSize: size }]}>{icon}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});
