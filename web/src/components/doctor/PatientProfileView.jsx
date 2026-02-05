import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../common/Button';
import TherapyProgress from '../therapy/TherapyProgress';
import engagementService from '../../services/engagementService';
import userService from '../../services/userService';
import therapyProgressService from '../../services/therapyProgressService';
import { showToast } from '../../utils/toast';
import { ArrowLeft, User, Mail, Calendar, Shield, Activity, Brain } from 'lucide-react';

/**
 * PatientProfileView Component
 * 
 * Allows doctors with FULL_ACCESS to view patient profile, assessments, and therapy progress.
 * Access control: Only for active engagements with FULL_ACCESS permission.
 * 
 * Features:
 * - Patient basic information
 * - Assessment history
 * - Therapy progress visualization
 * - Session statistics
 * - Access level indicator
 */
const PatientProfileView = () => {
  const { engagementId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [engagement, setEngagement] = useState(null);
  const [patient, setPatient] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatientData();
  }, [engagementId]);

  const fetchPatientData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch engagement details
      const engagements = await engagementService.getMyEngagements();
      const currentEngagement = engagements.find(e => e.id === parseInt(engagementId));
      
      if (!currentEngagement) {
        showToast.error('Engagement not found');
        navigate('/doctor-patients');
        return;
      }
      
      // Check if engagement is active and has FULL_ACCESS (case-insensitive)
      if (currentEngagement.status?.toLowerCase() !== 'active' || currentEngagement.accessRule?.toUpperCase() !== 'FULL_ACCESS') {
        showToast.error('You do not have full access to this patient\'s profile');
        setHasAccess(false);
        setEngagement(currentEngagement);
        setIsLoading(false);
        return;
      }
      
      setEngagement(currentEngagement);
      setHasAccess(true);
      
      // Fetch patient details
      const patientData = currentEngagement.patient;
      setPatient(patientData);
      
      // Fetch therapy progress
      const progress = await therapyProgressService.getProgressHistory();
      setProgressData(progress.content || []);
      
      // Fetch progress summary
      const summary = await therapyProgressService.getProgressSummary();
      setStats(summary);
      
    } catch (error) {
      console.error('Error loading patient data:', error);
      showToast.error('Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1A1625] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1A1625] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-textPrimary dark:text-white mb-2">
              Access Restricted
            </h2>
            <p className="text-textSecondary dark:text-gray-400 mb-6">
              You need FULL_ACCESS permission to view this patient's complete profile. 
              Current access level: {engagement?.accessRule || 'Unknown'}
            </p>
            <Button variant="primary" onClick={() => navigate('/doctor-patients')}>
              Back to Patients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1A1625]">
      {/* Header */}
      <div className="bg-white dark:bg-[#241D30] border-b border-gray-200 dark:border-[#3F3651] px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/doctor-patients')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#2A2235] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-textPrimary dark:text-white" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-textPrimary dark:text-white">
                Patient Profile
              </h1>
              <p className="text-sm text-textSecondary dark:text-gray-400">
                Viewing complete medical records and therapy progress
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
                FULL ACCESS
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 dark:border-[#3F3651]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'progress'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Therapy Progress
            </button>
            <button
              onClick={() => setActiveTab('assessments')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'assessments'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Assessments
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Patient Information */}
            <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-textPrimary dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-textSecondary dark:text-gray-400">Full Name</label>
                  <p className="text-lg font-medium text-textPrimary dark:text-white">
                    {patient?.firstName} {patient?.lastName}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-textSecondary dark:text-gray-400 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-lg font-medium text-textPrimary dark:text-white">
                    {patient?.email}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-textSecondary dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </label>
                  <p className="text-lg font-medium text-textPrimary dark:text-white">
                    {formatDate(patient?.createdAt)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-textSecondary dark:text-gray-400">Engagement Status</label>
                  <p className="text-lg font-medium text-green-600 dark:text-green-400">
                    Active since {formatDate(engagement?.startAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Statistics */}
            {stats && (
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-textPrimary dark:text-white">
                    {stats.totalAssessments || 0}
                  </p>
                  <p className="text-sm text-textSecondary dark:text-gray-400">
                    Total Assessments
                  </p>
                </div>

                <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Brain className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-textPrimary dark:text-white capitalize">
                    {stats.improvementTrend || 'N/A'}
                  </p>
                  <p className="text-sm text-textSecondary dark:text-gray-400">
                    Progress Trend
                  </p>
                </div>

                {stats.latestScores?.phq9 && (
                  <>
                    <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-2">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-3xl font-bold text-textPrimary dark:text-white">
                        {stats.latestScores.phq9.score}/27
                      </p>
                      <p className="text-sm text-textSecondary dark:text-gray-400">
                        Latest PHQ-9
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                        stats.latestScores.phq9.severity === 'Severe' || stats.latestScores.phq9.severity === 'Moderately Severe'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : stats.latestScores.phq9.severity === 'Moderate'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          : stats.latestScores.phq9.severity === 'Mild'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {stats.latestScores.phq9.severity}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="text-3xl font-bold text-textPrimary dark:text-white">
                        {progressData.length}
                      </p>
                      <p className="text-sm text-textSecondary dark:text-gray-400">
                        Completed Sessions
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-textPrimary dark:text-white mb-4">
                Recent Assessment Activity
              </h2>
              
              {progressData.length === 0 ? (
                <p className="text-textSecondary dark:text-gray-400 text-center py-8">
                  No assessment data available yet
                </p>
              ) : (
                <div className="space-y-3">
                  {progressData.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1A1625] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-textPrimary dark:text-white">
                            {item.assessmentType === 'phq9' ? 'PHQ-9 Depression Screening' : 
                             item.assessmentType === 'ipip50' ? 'IPIP-50 Personality' :
                             'IPIP-120 Comprehensive'}
                          </p>
                          <p className="text-sm text-textSecondary dark:text-gray-400">
                            {formatDate(item.completionDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {item.score}
                          {item.assessmentType === 'phq9' ? '/27' : '%'}
                        </p>
                        {item.severity && (
                          <span className="text-xs text-textSecondary dark:text-gray-400">
                            {item.severity}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Therapy Progress Tab */}
        {activeTab === 'progress' && (
          <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-6">
            <TherapyProgress />
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-textPrimary dark:text-white mb-6">
              Complete Assessment History
            </h2>
            
            {progressData.length === 0 ? (
              <p className="text-textSecondary dark:text-gray-400 text-center py-12">
                No assessments completed yet
              </p>
            ) : (
              <div className="space-y-4">
                {progressData.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-[#3F3651] rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-textPrimary dark:text-white">
                          {item.assessmentType === 'phq9' ? 'PHQ-9 Depression Screening' : 
                           item.assessmentType === 'ipip50' ? 'IPIP-50 Personality Assessment' :
                           'IPIP-120 Comprehensive Personality Assessment'}
                        </h3>
                        <p className="text-sm text-textSecondary dark:text-gray-400">
                          Completed on {formatDate(item.completionDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {item.score}
                          {item.assessmentType === 'phq9' ? '/27' : '%'}
                        </p>
                        {item.severity && (
                          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                            item.severity === 'Severe' || item.severity === 'Moderately Severe'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : item.severity === 'Moderate'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                              : item.severity === 'Mild'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {item.severity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Show traits for personality assessments */}
                    {(item.assessmentType === 'ipip50' || item.assessmentType === 'ipip120') && item.results?.traits && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#3F3651]">
                        <p className="text-sm font-medium text-textSecondary dark:text-gray-400 mb-3">
                          Personality Traits:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {Object.entries(item.results.traits).map(([trait, score]) => (
                            <div key={trait} className="text-center">
                              <div className="w-16 h-16 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary">{score}%</span>
                              </div>
                              <p className="text-xs text-textSecondary dark:text-gray-400 capitalize">
                                {trait}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfileView;
