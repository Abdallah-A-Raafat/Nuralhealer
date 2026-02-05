import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useLanguage } from '../../hooks/useLanguage';
import { userService } from '../../services/userService';
import engagementService from '../../services/engagementService';
import { showToast } from '../../utils/toast';
import { Clock, CheckCircle, XCircle, Copy, RefreshCw, Search, Users } from 'lucide-react';

const DoctorPatients = () => {
  const { t } = useLanguage();
  
  // Search states
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('FULL_ACCESS');
  
  // Token display states
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [currentToken, setCurrentToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  
  // Engagements list
  const [engagements, setEngagements] = useState([]);
  const [loadingEngagements, setLoadingEngagements] = useState(false);
  
  // Confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [engagementToDelete, setEngagementToDelete] = useState(null);
  
  // Cancel engagement modal
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [engagementToCancel, setEngagementToCancel] = useState(null);

  useEffect(() => {
    fetchEngagements();
  }, []);

  const fetchEngagements = async () => {
    try {
      setLoadingEngagements(true);
      const data = await engagementService.getMyEngagements();
      console.log('Engagements loaded:', data);
      setEngagements(data || []);
    } catch (error) {
      console.error('Failed to load engagements:', error);
      showToast.error(error.response?.data?.message || 'Failed to load engagements');
      setEngagements([]);
    } finally {
      setLoadingEngagements(false);
    }
  };

  const handleSearchPatient = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    try {
      setSearching(true);
      setSearchResult(null);
      setSearchError('');
      
      const response = await userService.searchUserByEmail(searchEmail);
      
      if (response.data && response.data.role === 'PATIENT') {
        setSearchResult(response.data);
      } else {
        setSearchError(t.engagement?.userNotPatient || 'User is not a patient');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError(error.response?.data?.message || t.engagement?.patientNotFound || 'Patient not found');
    } finally {
      setSearching(false);
    }
  };

  const handleSendEngagementRequest = async () => {
    if (!searchResult) return;

    try {
      const response = await engagementService.initiateEngagement(
        searchResult.id,
        selectedAccessLevel
      );
      
      console.log('Engagement response:', response);
      
      // Show token modal
      setCurrentToken(response.verification.token);
      setTokenExpiry(response.verification.expiresAt);
      setShowTokenModal(true);
      
      // Close search modal and refresh engagements
      setIsSearchModalOpen(false);
      setSearchEmail('');
      setSearchResult(null);
      setSelectedAccessLevel('FULL_ACCESS');
      fetchEngagements();
    } catch (error) {
      console.error('Failed to send engagement request:', error);
      setSearchError(error.response?.data?.message || t.engagement?.requestError || 'Failed to send request');
    }
  };

  const handleCopyToken = () => {
    if (currentToken) {
      navigator.clipboard.writeText(currentToken);
      showToast.success(t.engagement?.tokenCopied || 'Token copied to clipboard');
    }
  };

  const handleRefreshToken = async (engagementId) => {
    try {
      const response = await engagementService.refreshToken(engagementId);
      setCurrentToken(response.token);
      setTokenExpiry(response.expiresAt);
      showToast.success(t.engagement?.tokenRefreshed || 'Token refreshed successfully');
      fetchEngagements();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      showToast.error(error.response?.data?.message || 'Failed to refresh token');
    }
  };

  const handleDeleteEngagement = async (engagementId) => {
    setEngagementToDelete(engagementId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!engagementToDelete) return;
    
    try {
      await engagementService.deleteEngagement(engagementToDelete);
      showToast.success(t.engagement?.deleteSuccess || 'Engagement deleted');
      fetchEngagements();
    } catch (error) {
      console.error('Failed to delete engagement:', error);
      showToast.error(error.response?.data?.message || 'Failed to delete engagement');
    } finally {
      setShowDeleteConfirm(false);
      setEngagementToDelete(null);
    }
  };

  const handleCancelEngagement = (engagement) => {
    setEngagementToCancel(engagement);
    setShowCancelConfirm(true);
  };

  const confirmCancel = async () => {
    if (!engagementToCancel) return;
    
    try {
      // Doctor cancellation - no access rule needed (backend automatically revokes access)
      await engagementService.cancelEngagement(
        engagementToCancel.id,
        'Cancelled by doctor',
        null // Don't pass access rule for doctor
      );
      showToast.success(t.engagement?.cancelSuccess || 'Engagement cancelled');
      fetchEngagements();
    } catch (error) {
      console.error('Failed to cancel engagement:', error);
      showToast.error(error.response?.data?.message || 'Failed to cancel engagement');
    } finally {
      setShowCancelConfirm(false);
      setEngagementToCancel(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: t.engagement?.pending || 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
      },
      active: {
        label: t.engagement?.active || 'Active',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      ended: {
        label: t.engagement?.ended || 'Ended',
        color: 'bg-gray-100 text-gray-800',
        icon: XCircle,
      },
      cancelled: {
        label: t.engagement?.cancelled || 'Cancelled',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const pendingEngagements = engagements.filter(e => e?.status === 'pending');
  const activeEngagements = engagements.filter(e => e?.status === 'active');
  const otherEngagements = engagements.filter(e => e?.status !== 'pending' && e?.status !== 'active');

  // Add error check
  if (!Array.isArray(engagements)) {
    console.error('Engagements is not an array:', engagements);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error loading engagements</h2>
          <p className="text-textSecondary mb-4">Invalid data format</p>
          <Button onClick={fetchEngagements}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-textPrimary mb-2">
              {t.doctor?.patients?.title || 'My Patients'}
            </h1>
            <p className="text-textSecondary">
              {t.doctor?.patients?.description || 'Manage patient engagements'}
            </p>
          </div>
          <Button
            variant="primary"
            size="large"
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            {t.engagement?.addPatient || 'Add Patient'}
          </Button>
        </div>

        {/* Pending Engagements */}
        {pendingEngagements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-textPrimary mb-4">
              {t.engagement?.pendingRequests || 'Pending Requests'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingEngagements.map(engagement => (
                <div key={engagement.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-textPrimary">
                        {engagement.patient?.firstName || 'Unknown'} {engagement.patient?.lastName || 'Patient'}
                      </h3>
                      <p className="text-sm text-textSecondary">{engagement.patient?.email || 'N/A'}</p>
                    </div>
                    {getStatusBadge(engagement.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="small"
                      className="w-full"
                      onClick={() => {
                        engagementService.getCurrentToken(engagement.id)
                          .then(response => {
                            setCurrentToken(response.token);
                            setTokenExpiry(response.expiresAt);
                            setShowTokenModal(true);
                          })
                          .catch(() => handleRefreshToken(engagement.id));
                      }}
                    >
                      {t.engagement?.viewToken || 'View Token'}
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleDeleteEngagement(engagement.id)}
                    >
                      {t.engagement?.deleteRequest || 'Delete Request'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Engagements */}
        {activeEngagements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-textPrimary mb-4">
              {t.engagement?.activeEngagements || 'Active Engagements'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeEngagements.map(engagement => (
                <div key={engagement.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-textPrimary">
                        {engagement.patient?.firstName || 'Unknown'} {engagement.patient?.lastName || 'Patient'}
                      </h3>
                      <p className="text-sm text-textSecondary">{engagement.patient?.email || 'N/A'}</p>
                    </div>
                    {getStatusBadge(engagement.status)}
                  </div>
                  
                  <div className="text-sm text-textSecondary mb-4">
                    <p>Access: {engagement.accessRule || 'N/A'}</p>
                    <p>Started: {engagement.startAt ? new Date(engagement.startAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      variant="primary"
                      size="small"
                      className="w-full"
                      onClick={() => window.location.href = `/patient-profile/${engagement.id}`}
                      disabled={engagement.accessRule !== 'FULL_ACCESS'}
                    >
                      {t.engagement?.viewProfile || 'View Profile'}
                      {engagement.accessRule !== 'FULL_ACCESS' && ' (Limited Access)'}
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleCancelEngagement(engagement)}
                    >
                      {t.engagement?.cancelEngagement || 'Cancel Engagement'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {engagements.length === 0 && !loadingEngagements && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-textPrimary mb-2">
              {t.engagement?.noEngagements || 'No patient engagements yet'}
            </h3>
            <p className="text-textSecondary mb-6">
              {t.engagement?.noEngagementsDesc || 'Click "Add Patient" to start connecting with patients'}
            </p>
            <Button
              variant="primary"
              onClick={() => setIsSearchModalOpen(true)}
            >
              {t.engagement?.addPatient || 'Add Patient'}
            </Button>
          </div>
        )}

        {/* Search Patient Modal */}
        <Modal
          isOpen={isSearchModalOpen}
          onClose={() => {
            setIsSearchModalOpen(false);
            setSearchEmail('');
            setSearchResult(null);
            setSearchError('');
          }}
          title={t.engagement?.searchPatient || 'Search Patient'}
          size="medium"
        >
          <form onSubmit={handleSearchPatient} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-2">
                {t.engagement?.patientEmail || 'Patient Email'}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder={t.engagement?.searchPlaceholder || 'Enter patient email'}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={searching}
                >
                  {searching ? t.common?.loading : t.engagement?.search || 'Search'}
                </Button>
              </div>
            </div>

            {searchError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{searchError}</p>
              </div>
            )}

            {searchResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-textPrimary mb-2">
                  {t.engagement?.patientFound || 'Patient Found'}
                </h4>
                <p className="text-sm mb-1">
                  <strong>Name:</strong> {searchResult.firstName} {searchResult.lastName}
                </p>
                <p className="text-sm mb-4">
                  <strong>Email:</strong> {searchResult.email}
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-textPrimary mb-2">
                    {t.engagement?.accessLevel || 'Access Level'}
                  </label>
                  <select
                    value={selectedAccessLevel}
                    onChange={(e) => setSelectedAccessLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="FULL_ACCESS">{t.engagement?.fullAccess || 'Full Access'}</option>
                    <option value="LIMITED_ACCESS">{t.engagement?.limitedAccess || 'Limited Access'}</option>
                    <option value="NO_ACCESS">{t.engagement?.noAccess || 'No Access'}</option>
                  </select>
                  <p className="text-xs text-textSecondary mt-1">
                    {selectedAccessLevel === 'FULL_ACCESS' && (t.engagement?.fullAccessDesc || 'Access to all medical records and chat history')}
                    {selectedAccessLevel === 'LIMITED_ACCESS' && (t.engagement?.limitedAccessDesc || 'Access to basic information only')}
                    {selectedAccessLevel === 'NO_ACCESS' && (t.engagement?.noAccessDesc || 'No access to medical records')}
                  </p>
                </div>
                
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleSendEngagementRequest}
                >
                  {t.engagement?.sendRequest || 'Send Engagement Request'}
                </Button>
              </div>
            )}
          </form>
        </Modal>

        {/* Token Display Modal */}
        <Modal
          isOpen={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          title={t.engagement?.verificationCode || 'Verification Code'}
          size="small"
        >
          <div className="text-center space-y-4">
            <p className="text-textSecondary">
              {t.engagement?.shareCodeMessage || 'Share this code with the patient'}
            </p>
            
            <div className="bg-gray-100 rounded-lg p-6">
              <div className="text-5xl font-bold tracking-widest text-primary mb-2">
                {currentToken}
              </div>
              <button
                onClick={handleCopyToken}
                className="flex items-center justify-center gap-2 mx-auto mt-4 text-sm text-primary hover:text-primary-dark"
              >
                <Copy className="w-4 h-4" />
                {t.engagement?.copyCode || 'Copy Code'}
              </button>
            </div>
            
            <p className="text-sm text-textSecondary">
              {t.engagement?.expiresIn || 'Expires:'} {tokenExpiry ? new Date(tokenExpiry).toLocaleString() : '-'}
            </p>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-textSecondary mb-2">
                {t.engagement?.tokenExpiredHelp || 'Token expired? Click refresh to generate a new one.'}
              </p>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setEngagementToDelete(null);
          }}
          title={t.engagement?.confirmDelete || 'Confirm Delete'}
          size="small"
        >
          <div className="space-y-4">
            <p className="text-textSecondary">
              {t.engagement?.confirmDeleteMessage || 'Are you sure you want to delete this engagement request? This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEngagementToDelete(null);
                }}
              >
                {t.common?.cancel || 'Cancel'}
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={confirmDelete}
              >
                {t.engagement?.deleteRequest || 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
        
        {/* Cancel Engagement Confirmation Modal */}
        <Modal
          isOpen={showCancelConfirm}
          onClose={() => {
            setShowCancelConfirm(false);
            setEngagementToCancel(null);
          }}
          title={t.engagement?.cancelEngagement || 'Cancel Engagement'}
          size="small"
        >
          <div className="space-y-4">
            <p className="text-textSecondary">
              {t.engagement?.confirmCancelMessage || 'Are you sure you want to cancel this engagement? The patient will lose access to their records.'}
            </p>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {t.engagement?.cancelInfo || 'Patient access will be set to: No Access'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCancelConfirm(false);
                  setEngagementToCancel(null);
                }}
              >
                {t.common?.cancel || 'Cancel'}
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={confirmCancel}
              >
                {t.engagement?.confirmCancel || 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DoctorPatients;
