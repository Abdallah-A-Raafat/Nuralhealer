import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import userService from '../../services/userService';
import engagementService from '../../services/engagementService';
import { useLanguage } from '../../hooks/useLanguage';
import { Clock, CheckCircle, XCircle, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    voiceSessions: 0,
    textSessions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [pastSessions, setPastSessions] = useState([]);
  
  // Engagement states
  const [engagements, setEngagements] = useState([]);
  const [verificationToken, setVerificationToken] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Fetch user profile data and statistics
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user profile data
        const userData = await userService.getCurrentUser();
        setProfileData(userData);
        
        // Fetch user statistics
        const userStats = await userService.getUserStats();
        setStats(userStats);
        
        // Fetch session history
        const sessions = await userService.getSessionHistory();
        setPastSessions(sessions);
        
        // Fetch engagements if on engagements tab
        if (activeTab === 'engagements') {
          await fetchEngagements();
        }
        
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [activeTab]);

  const fetchEngagements = async () => {
    try {
      const data = await engagementService.getMyEngagements();
      setEngagements(data || []);
    } catch (error) {
      console.error('Failed to load engagements:', error);
    }
  };

  const handleVerifyEngagement = async (engagementId) => {
    if (!verificationToken.trim()) {
      alert(t.engagement?.enterToken || 'Please enter verification token');
      return;
    }

    try {
      setVerifying(true);
      await engagementService.verifyEngagement(verificationToken);
      alert(t.engagement?.verificationSuccess || 'Engagement verified successfully!');
      setVerificationToken('');
      await fetchEngagements();
    } catch (error) {
      console.error('Verification failed:', error);
      alert(error.response?.data?.message || t.engagement?.verificationFailed || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  // Format date from ISO string to readable format
  const formatDate = (dateString) => {
    if (!dateString) return t.patient.profile.notAvailable;
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getMoodColor = (mood) => {
    const colors = {
      'Anxious': 'bg-red-100 text-red-800',
      'Stressed': 'bg-orange-100 text-orange-800',
      'Worried': 'bg-yellow-100 text-yellow-800',
      'Neutral': 'bg-gray-100 text-gray-800',
      'Tired': 'bg-blue-100 text-blue-800',
      'Uncertain': 'bg-purple-100 text-purple-800',
      'Calm': 'bg-green-100 text-green-800',
      'Relaxed': 'bg-green-100 text-green-800',
      'Optimistic': 'bg-green-100 text-green-800',
      'Motivated': 'bg-green-100 text-green-800',
      'Refreshed': 'bg-green-100 text-green-800',
      'Hopeful': 'bg-green-100 text-green-800',
    };
    return colors[mood] || 'bg-gray-100 text-gray-800';
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      'Calm': 'bg-blue-100 text-blue-800',
      'Improved': 'bg-green-100 text-green-800',
      'Positive': 'bg-green-100 text-green-800',
      'Good': 'bg-green-100 text-green-800',
    };
    return colors[emotion] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-textPrimary mb-2">{t.patient.profile.title}</h1>
          <p className="text-textSecondary">{t.patient.profile.description}</p>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              {t.patient.profile.accountOverview}
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'sessions'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              {t.patient.profile.pastSessions}
            </button>
            <button
              onClick={() => setActiveTab('engagements')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'engagements'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              {t.engagement?.myEngagements || 'My Engagements'}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              {t.patient.profile.settings}
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Account Information Card */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">{t.patient.profile.accountInformation}</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Side */}
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-textSecondary">{t.patient.profile.fullName}</label>
                    <p className="text-lg font-medium text-textPrimary">
                      {isLoading ? t.common.loading : `${profileData?.firstName || user?.firstName || ''} ${profileData?.lastName || user?.lastName || ''}`}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-textSecondary">{t.patient.profile.emailAddress}</label>
                    <p className="text-lg font-medium text-textPrimary">
                      {isLoading ? t.common.loading : (profileData?.email || user?.email || 'N/A')}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-textSecondary">{t.patient.profile.accountType}</label>
                    <p className="inline-block mt-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                      {isLoading ? t.common.loading : (profileData?.role || user?.role || t.common.patient)}
                    </p>
                  </div>
                </div>

                {/* Right Side */}
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-textSecondary">{t.patient.profile.memberSince}</label>
                    <p className="text-lg font-medium text-textPrimary">
                      {isLoading ? t.common.loading : formatDate(profileData?.createdAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-textSecondary">{t.patient.profile.accountStatus}</label>
                    <p className="inline-block mt-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium text-sm">
                      {t.patient.profile.active}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-textSecondary">{t.patient.profile.emailVerification}</label>
                    <p className={`inline-block mt-1 px-3 py-1 rounded-full font-medium text-sm ${
                      profileData?.emailVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isLoading ? t.common.loading : (profileData?.emailVerified ? t.patient.profile.verified : t.patient.profile.notVerified)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <Button variant="outline" size="large">
                  {t.patient.profile.editProfile}
                </Button>
              </div>
            </div>

            {/* Therapy Progress Stats */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">{t.patient.profile.therapyProgress}</h2>
              
              {isLoading ? (
                <div className="text-center py-8 text-textSecondary">{t.patient.profile.loadingStatistics}</div>
              ) : stats.totalSessions === 0 ? (
                <div className="text-center py-8">
                  <p className="text-textSecondary mb-4">{t.patient.profile.noSessionsYet}</p>
                  <p className="text-sm text-textSecondary">{t.patient.profile.startFirstSession}</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-2">{stats.totalSessions}</div>
                    <p className="text-sm text-textSecondary">{t.patient.profile.totalSessions}</p>
                  </div>

                  <div className="text-center p-4 bg-secondary/5 rounded-lg">
                    <div className="text-3xl font-bold text-secondary mb-2">{stats.totalMinutes}</div>
                    <p className="text-sm text-textSecondary">{t.patient.profile.totalMinutes}</p>
                  </div>

                  <div className="text-center p-4 bg-accent/20 rounded-lg">
                    <div className="text-3xl font-bold text-accent mb-2">{stats.voiceSessions}</div>
                    <p className="text-sm text-textSecondary">{t.patient.profile.voiceSessions}</p>
                  </div>

                  <div className="text-center p-4 bg-green-100 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">{stats.textSessions}</div>
                    <p className="text-sm text-textSecondary">{t.patient.profile.textSessions}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recommended Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <h3 className="text-lg font-bold text-blue-900 mb-4">💡 {t.patient.profile.recommendedNextSteps}</h3>
              <ul className="space-y-2 text-blue-800 text-sm" dir="rtl">
                <li>✓ {t.patient.profile.recommendedStep1}</li>
                <li>✓ {t.patient.profile.recommendedStep2}</li>
                <li>✓ {t.patient.profile.recommendedStep3}</li>
                <li>✓ {t.patient.profile.recommendedStep4}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-textSecondary">{t.patient.profile.loadingSessionHistory}</div>
              ) : pastSessions.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-textSecondary mb-4">{t.patient.profile.noSessionsRecorded}</p>
                  <p className="text-sm text-textSecondary">{t.patient.profile.sessionsWillAppear}</p>
                </div>
              ) : (
                /* Sessions List */
                <div className="divide-y divide-gray-200">
                {pastSessions.map((session) => (
                  <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left Side - Date and Type */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl">
                            {session.type === 'Text Session' ? '💬' : '🎤'}
                          </div>
                          <div>
                            <p className="font-semibold text-textPrimary">{session.type}</p>
                            <p className="text-sm text-textSecondary">
                              {new Date(session.date).toLocaleDateString('ar-EG')} في {session.time}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-textSecondary">{t.patient.profile.duration}: {session.duration}</p>
                      </div>

                      {/* Middle - Mood Journey */}
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getMoodColor(session.mood_before)}`}>
                          {session.mood_before}
                        </div>
                        <svg className="w-4 h-4 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getMoodColor(session.mood_after)}`}>
                          {session.mood_after}
                        </div>
                      </div>

                      {/* Right Side - Emotion Tag */}
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEmotionColor(session.emotion)}`}>
                          {session.emotion}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-textSecondary" dir="rtl">
                        <strong>{t.patient.profile.sessionNotes}:</strong> {session.notes}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4">
                      <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                        {t.patient.profile.viewFullDetails} →
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              )}

              {/* Pagination - Only show if there are sessions */}
              {!isLoading && pastSessions.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                  <p className="text-sm text-textSecondary">{t.patient.profile.showing} {pastSessions.length} {t.patient.profile.of} {pastSessions.length} {t.patient.profile.sessions}</p>
                <div className="space-x-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50" disabled>
                    {t.patient.profile.previous}
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50" disabled>
                    {t.patient.profile.next}
                  </button>
                </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Engagements Tab */}
        {activeTab === 'engagements' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Pending Engagements */}
            {engagementService.getPendingEngagements(engagements).length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-textPrimary mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  {t.engagement?.pendingRequests || 'Pending Verification'}
                </h2>
                
                <div className="space-y-4">
                  {engagementService.getPendingEngagements(engagements).map(engagement => (
                    <div key={engagement.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-textPrimary text-lg">
                            Dr. {engagement.doctor.firstName} {engagement.doctor.lastName}
                          </h3>
                          <p className="text-sm text-textSecondary">{engagement.doctor.email}</p>
                          <p className="text-xs text-textSecondary mt-1">
                            {t.engagement?.requestedOn || 'Requested on:'} {new Date(engagement.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3" />
                          {t.engagement?.pending || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <label className="block text-sm font-medium text-textPrimary mb-2">
                          {t.engagement?.enterVerificationCode || 'Enter 6-digit code from your doctor:'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={verificationToken}
                            onChange={(e) => setVerificationToken(e.target.value.toUpperCase())}
                            placeholder="NH-XXXXXX"
                            maxLength={9}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-lg"
                          />
                          <Button
                            variant="primary"
                            onClick={() => handleVerifyEngagement(engagement.id)}
                            disabled={verifying || !verificationToken.trim()}
                          >
                            {verifying ? t.common?.loading : t.engagement?.verify || 'Verify'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 p-3 rounded">
                        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{t.engagement?.verificationHelp || 'Ask your doctor to provide the 6-digit verification code. This ensures secure connection between you and your healthcare provider.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Engagements */}
            {engagementService.getActiveEngagements(engagements).length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-textPrimary mb-6 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  {t.engagement?.activeEngagements || 'Active Healthcare Providers'}
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {engagementService.getActiveEngagements(engagements).map(engagement => (
                    <div key={engagement.id} className="border border-green-200 bg-green-50 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-textPrimary">
                            Dr. {engagement.doctor.firstName} {engagement.doctor.lastName}
                          </h3>
                          <p className="text-xs text-textSecondary">{engagement.doctor.email}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          {t.engagement?.active || 'Active'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-textSecondary mb-3">
                        <p>{t.engagement?.accessLevel || 'Access'}: {engagement.accessRule}</p>
                        <p>{t.engagement?.since || 'Since'}: {new Date(engagement.startAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="pt-3 border-t border-green-200">
                        <p className="text-xs text-green-700">
                          ✓ {t.engagement?.canAccessRecords || 'Can access your medical records and chat history'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ended/Cancelled Engagements */}
            {engagementService.getEndedEngagements(engagements).length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-textPrimary mb-6 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-gray-600" />
                  {t.engagement?.pastEngagements || 'Past Engagements'}
                </h2>
                
                <div className="space-y-3">
                  {engagementService.getEndedEngagements(engagements).map(engagement => (
                    <div key={engagement.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-textPrimary">
                            Dr. {engagement.doctor.firstName} {engagement.doctor.lastName}
                          </h4>
                          <p className="text-xs text-textSecondary">
                            {new Date(engagement.startAt).toLocaleDateString()} - {engagement.endAt ? new Date(engagement.endAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          engagement.status === 'cancelled' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <XCircle className="w-3 h-3" />
                          {engagement.status === 'cancelled' ? (t.engagement?.cancelled || 'Cancelled') : (t.engagement?.ended || 'Ended')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {engagements.length === 0 && !isLoading && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-textPrimary mb-2">
                  {t.engagement?.noEngagements || 'No Healthcare Provider Connections'}
                </h3>
                <p className="text-textSecondary mb-6">
                  {t.engagement?.noEngagementsPatient || 'When a doctor sends you an engagement request, it will appear here for verification.'}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm text-blue-800">
                  <p className="font-semibold mb-2">{t.engagement?.howItWorks || 'How it works:'}</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>{t.engagement?.step1 || 'Your doctor searches for you by email'}</li>
                    <li>{t.engagement?.step2 || 'Doctor sends you an engagement request'}</li>
                    <li>{t.engagement?.step3 || 'Doctor provides you with a 6-digit code'}</li>
                    <li>{t.engagement?.step4 || 'You enter the code here to verify'}</li>
                    <li>{t.engagement?.step5 || 'Connection established securely!'}</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">{t.patient.profile.notificationSettings}</h2>
              
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                  <div className="ml-4">
                    <p className="font-medium text-textPrimary">{t.patient.profile.sessionReminders}</p>
                    <p className="text-sm text-textSecondary">{t.patient.profile.sessionRemindersDesc}</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                  <div className="ml-4">
                    <p className="font-medium text-textPrimary">{t.patient.profile.emailUpdates}</p>
                    <p className="text-sm text-textSecondary">{t.patient.profile.emailUpdatesDesc}</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="w-4 h-4 text-primary rounded" />
                  <div className="ml-4">
                    <p className="font-medium text-textPrimary">{t.patient.profile.marketingEmails}</p>
                    <p className="text-sm text-textSecondary">{t.patient.profile.marketingEmailsDesc}</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">{t.patient.profile.privacySecurity}</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-textPrimary">{t.patient.profile.changePassword}</p>
                    <p className="text-sm text-textSecondary">{t.patient.profile.changePasswordDesc}</p>
                  </div>
                  <Button variant="outline" size="small">
                    {t.patient.profile.change}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-textPrimary">{t.patient.profile.twoFactorAuth}</p>
                    <p className="text-sm text-textSecondary">{t.patient.profile.twoFactorAuthDesc}</p>
                  </div>
                  <Button variant="outline" size="small">
                    {t.patient.profile.enable}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-textPrimary">{t.patient.profile.privacyPolicy}</p>
                    <p className="text-sm text-textSecondary">{t.patient.profile.privacyPolicyDesc}</p>
                  </div>
                  <svg className="w-5 h-5 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-red-900 mb-4">{t.patient.profile.dangerZone}</h2>
              <p className="text-red-800 text-sm mb-4">
                {t.patient.profile.dangerZoneDesc}
              </p>
              <Button variant="danger" size="large">
                {t.patient.profile.deleteAccount}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
