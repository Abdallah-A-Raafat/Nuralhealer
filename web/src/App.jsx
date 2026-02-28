import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './hooks/useLanguage.jsx';
import { DarkModeProvider } from './hooks/useDarkMode.jsx';
import Navbar from './components/common/Navbar';
import NotificationToast from './components/common/NotificationToast';
import Home from './pages/Home';
import AboutContact from './pages/AboutContact';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DoctorProtectedRoute from './components/auth/DoctorProtectedRoute';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import PatientProfileView from './components/doctor/PatientProfileView';
import Chat from './pages/patient/Chat';
import Doctors from './pages/patient/Doctors';
import Profile from './pages/patient/Profile';
import Assessments from './pages/patient/Assessments';
import EngagementChat from './components/engagement/EngagementChat';
import EngagementVerification from './pages/EngagementVerification';
import OtpVerification from './pages/OtpVerification';
import LiveSession from './pages/livesession/LiveSession';

function App() {
  return (
    <DarkModeProvider>
      <LanguageProvider>
        <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <NotificationToast />
          <div className="min-h-screen bg-background dark:bg-[#1A1625] transition-colors duration-300">
            <Navbar />
            <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutContact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<OtpVerification />} />
          <Route
            path="/verify-engagement"
            element={
              <DoctorProtectedRoute>
                <EngagementVerification />
              </DoctorProtectedRoute>
            }
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking" 
            element={
              <ProtectedRoute>
                <Doctors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assessments" 
            element={
              <ProtectedRoute>
                <Assessments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/engagement-chat/:engagementId" 
            element={
              <ProtectedRoute>
                <EngagementChat />
              </ProtectedRoute>
            } 
          />
          {/* Live Session Routes — public for functionality testing */}
          <Route path="/live-session" element={<LiveSession />} />
          <Route path="/live-session/:sessionId" element={<LiveSession />} />

          {/* Doctor Routes */}
          <Route 
            path="/doctor-dashboard" 
            element={
              <DoctorProtectedRoute>
                <DoctorDashboard />
              </DoctorProtectedRoute>
            } 
          />
          <Route 
            path="/doctor-appointments" 
            element={
              <DoctorProtectedRoute>
                <DoctorAppointments />
              </DoctorProtectedRoute>
            } 
          />
          <Route 
            path="/doctor-patients" 
            element={
              <DoctorProtectedRoute>
                <DoctorPatients />
              </DoctorProtectedRoute>
            } 
          />
          <Route 
            path="/patient-profile/:engagementId" 
            element={
              <DoctorProtectedRoute>
                <PatientProfileView />
              </DoctorProtectedRoute>
            } 
          />
            </Routes>
          </div>
        </Router>
      </LanguageProvider>
    </DarkModeProvider>
  );
}

export default App;
