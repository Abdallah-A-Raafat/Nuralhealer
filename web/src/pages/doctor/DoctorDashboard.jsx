import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useLanguage } from '../../hooks/useLanguage';
import engagementService from '../../services/engagementService';
import { showToast } from '../../utils/toast';

const DoctorDashboard = () => {
  const { t } = useLanguage();
  const [engagements, setEngagements] = useState([]);
  const [loadingEngagements, setLoadingEngagements] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedEngagement, setSelectedEngagement] = useState(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Fetch engagements on mount
  useEffect(() => {
    fetchEngagements();
  }, []);

  const fetchEngagements = async () => {
    try {
      setLoadingEngagements(true);
      const data = await engagementService.getMyEngagements();
      setEngagements(data);
    } catch (error) {
      console.error('Failed to fetch engagements:', error);
    } finally {
      setLoadingEngagements(false);
    }
  };

  const handleVerifyEngagement = async (engagement) => {
    setSelectedEngagement(engagement);
    setShowVerificationModal(true);
  };

  const handleConfirmVerification = async () => {
    if (!verificationToken.trim()) {
      showToast.warning('Please enter the verification token');
      return;
    }

    try {
      setProcessingAction(true);
      await engagementService.verifyEngagement(verificationToken);
      showToast.success('Engagement verified successfully!');
      setShowVerificationModal(false);
      setVerificationToken('');
      setSelectedEngagement(null);
      fetchEngagements(); // Refresh list
    } catch (error) {
      console.error('Failed to verify engagement:', error);
      showToast.error(error.response?.data?.message || 'Failed to verify engagement');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectEngagement = async (engagementId) => {
    if (!confirm('Are you sure you want to reject this engagement request?')) {
      return;
    }

    try {
      setProcessingAction(true);
      await engagementService.deleteEngagement(engagementId);
      showToast.success('Engagement request rejected');
      fetchEngagements(); // Refresh list
    } catch (error) {
      console.error('Failed to reject engagement:', error);
      showToast.error(error.response?.data?.message || 'Failed to reject engagement');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return badges[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const pendingEngagements = engagements.filter(e => e.status === 'PENDING');
  const pendingForDoctorVerification = pendingEngagements.filter(
    (engagement) => engagement.initiatedBy?.toLowerCase() === 'patient'
  );
  const pendingForPatientVerification = pendingEngagements.filter(
    (engagement) => engagement.initiatedBy?.toLowerCase() === 'doctor'
  );

  const stats = [
    {
      label: t.doctor.dashboard.totalPatients,
      value: '0',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: t.doctor.dashboard.appointmentsThisWeek,
      value: '0',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: t.doctor.dashboard.sessionsCompleted,
      value: '0',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const recentActivities = [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-textPrimary mb-2">{t.doctor.dashboard.welcomeBack}</h1>
          <p className="text-textSecondary">{t.doctor.dashboard.practiceOverview}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-textSecondary text-sm font-medium">{stat.label}</h3>
                <div className="text-primary">{stat.icon}</div>
              </div>
              <div className="text-3xl font-bold text-textPrimary">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-textPrimary mb-4">{t.doctor.dashboard.quickActions}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/doctor-appointments">
              <Button variant="outline" size="large" className="w-full">
                {t.doctor.dashboard.viewAppointments}
              </Button>
            </Link>
            <Link to="/doctor-patients">
              <Button variant="outline" size="large" className="w-full">
                {t.doctor.dashboard.managePatients}
              </Button>
            </Link>
          </div>
        </div>

        {/* Pending Engagement Requests */}
        {loadingEngagements ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-textSecondary mt-4">Loading engagement requests...</p>
            </div>
          </div>
        ) : pendingEngagements.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-textPrimary">
                Pending Engagement Requests
                <span className="ml-2 text-sm font-normal bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {pendingForDoctorVerification.length}
                </span>
              </h2>
            </div>
            <div className="space-y-4">
              {pendingForDoctorVerification.map((engagement) => (
                <div
                  key={engagement.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                          {engagement.patientName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-textPrimary">
                            {engagement.patientName || 'Patient'}
                          </h3>
                          <p className="text-sm text-textSecondary">
                            Requested on {new Date(engagement.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="ml-15 space-y-1">
                        <p className="text-sm text-textSecondary">
                          <span className="font-medium">Access Level:</span>{' '}
                          {engagement.accessRule || 'Full Access'}
                        </p>
                        <p className="text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(engagement.status)}`}>
                            {engagement.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleVerifyEngagement(engagement)}
                        disabled={processingAction}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleRejectEngagement(engagement.id)}
                        disabled={processingAction}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingForDoctorVerification.length === 0 && (
                <div className="text-sm text-textSecondary bg-blue-50 border border-blue-200 rounded-lg p-4">
                  No patient-initiated requests are waiting for your verification right now.
                </div>
              )}

              {pendingForPatientVerification.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-textPrimary mb-1">Awaiting Patient Verification</p>
                  <p className="text-sm text-textSecondary">
                    {pendingForPatientVerification.length} request(s) were initiated by you and are waiting for patient verification.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-textPrimary mb-4">{t.doctor.dashboard.recentActivity}</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start justify-between pb-4 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-textPrimary">{activity.patient}</p>
                  <p className="text-sm text-textSecondary">{activity.action}</p>
                </div>
                <span className="text-xs text-textSecondary">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <Modal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setVerificationToken('');
          setSelectedEngagement(null);
        }}
        title="Verify Engagement Request"
        size="medium"
      >
        {selectedEngagement && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Patient Information</h4>
              <p className="text-sm text-blue-800">
                <span className="font-medium">Name:</span> {selectedEngagement.patientName}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <span className="font-medium">Access Level:</span> {selectedEngagement.accessRule || 'Full Access'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-textPrimary">
                Verification Token from Patient
              </label>
              <input
                type="text"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                placeholder="Enter 6-digit token"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                maxLength={6}
              />
              <p className="text-xs text-textSecondary">
                The patient should provide you with a 6-digit verification token to complete the engagement.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleConfirmVerification}
                disabled={processingAction || !verificationToken.trim()}
              >
                {processingAction ? 'Verifying...' : 'Verify & Accept'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationToken('');
                  setSelectedEngagement(null);
                }}
                disabled={processingAction}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
