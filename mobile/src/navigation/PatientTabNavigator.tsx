import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { PatientTabParamList } from './types';
import { useThemeStore } from '../store/themeStore';
import { TabBarIcon } from '../components/common/TabBarIcon';

// Screens
import HomeScreen from '../screens/patient/HomeScreen';
import ChatScreen from '../screens/patient/ChatScreen';
import AssessmentsScreen from '../screens/patient/AssessmentsScreen';
import DoctorsScreen from '../screens/patient/DoctorsScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';

const Tab = createBottomTabNavigator<PatientTabParamList>();

export const PatientTabNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('nav.home'),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: t('nav.chat'),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="chatbubble-ellipses" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Assessments"
        component={AssessmentsScreen}
        options={{
          tabBarLabel: t('nav.assessments'),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="clipboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Doctors"
        component={DoctorsScreen}
        options={{
          tabBarLabel: t('nav.doctors'),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="medical" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('nav.profile'),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
