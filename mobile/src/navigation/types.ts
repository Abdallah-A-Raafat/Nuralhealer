import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Patient Tab Navigator
export type PatientTabParamList = {
  Home: undefined;
  Chat: undefined;
  Assessments: undefined;
  Doctors: undefined;
  Profile: undefined;
};

// Patient Stack (includes tabs and other screens)
export type PatientStackParamList = {
  PatientTabs: NavigatorScreenParams<PatientTabParamList>;
  Booking: undefined;
  SessionHistory: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

// Doctor Tab Navigator
export type DoctorTabParamList = {
  DoctorHome: undefined;
  Patients: undefined;
  Schedule: undefined;
  DoctorProfile: undefined;
};

// Doctor Stack (includes tabs and other screens)
export type DoctorStackParamList = {
  DoctorTabs: NavigatorScreenParams<DoctorTabParamList>;
  PatientDetail: { patientId: string };
  SessionNotes: { sessionId: string; patientId: string };
  EditProfile: undefined;
  Settings: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Patient: NavigatorScreenParams<PatientStackParamList>;
  Doctor: NavigatorScreenParams<DoctorStackParamList>;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type PatientStackScreenProps<T extends keyof PatientStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<PatientStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type PatientTabScreenProps<T extends keyof PatientTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<PatientTabParamList, T>,
    PatientStackScreenProps<keyof PatientStackParamList>
  >;

export type DoctorStackScreenProps<T extends keyof DoctorStackParamList> = 
  CompositeScreenProps<
    NativeStackScreenProps<DoctorStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type DoctorTabScreenProps<T extends keyof DoctorTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<DoctorTabParamList, T>,
    DoctorStackScreenProps<keyof DoctorStackParamList>
  >;

// Declare global navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
