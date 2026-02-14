import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import engagementService from '../services/engagementService';
import { showToast } from '../utils/toast';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

const EngagementVerification = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No verification token provided');
      setLoading(false);
      return;
    }

    // For doctors, we need to check if this token is for them
    // The backend will validate this, but we can show a preview
    setLoading(false);
  }, [token]);

  const handleVerifyEngagement = async () => {
    if (!token) return;

    try {
      setVerifying(true);
      const result = await engagementService.verifyEngagement(token);

      showToast.success('Engagement verified successfully! You can now access the patient\'s information.');
      navigate('/doctor-dashboard');
    } catch (error) {
      console.error('Verification failed:', error);
      setError(error.response?.data?.message || 'Verification failed. The token may be invalid or expired.');
      showToast.error('Verification failed');
    } finally {
      setVerifying(false);
      setShowConfirmModal(false);
    }
  };

  const handleDeclineEngagement = async () => {
    // For now, just navigate back - doctors can decline from dashboard
    navigate('/doctor-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Loading verification details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-textPrimary mb-4">Verification Failed</h1>
          <p className="text-textSecondary mb-6">{error}</p>
          <Button onClick={() => navigate('/doctor-dashboard')} variant="primary">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-textPrimary mb-2">
            Engagement Request Verification
          </h1>
          <p className="text-textSecondary">
            A patient has requested to connect with you for healthcare services.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• By accepting, you'll gain access to the patient's medical records and chat history</li>
                <li>• You can communicate securely through the engagement chat</li>
                <li>• You can manage access levels and end the engagement at any time</li>
                <li>• All interactions are logged for compliance and quality assurance</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Security & Privacy</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Patient data is encrypted and access-controlled</li>
                <li>• All access is logged and auditable</li>
                <li>• You can modify access permissions after acceptance</li>
                <li>• Patients can request to end the engagement at any time</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => setShowConfirmModal(true)}
            disabled={verifying}
          >
            {verifying ? 'Verifying...' : 'Accept Engagement Request'}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDeclineEngagement}
            disabled={verifying}
          >
            Review Later
          </Button>
        </div>

        <p className="text-xs text-textSecondary text-center mt-4">
          You can also manage this request from your doctor dashboard
        </p>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Engagement Acceptance"
        size="medium"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900">Ready to Accept</h4>
                <p className="text-sm text-green-800 mt-1">
                  This will activate the engagement and give you secure access to the patient's healthcare information.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleVerifyEngagement}
              disabled={verifying}
            >
              {verifying ? 'Accepting...' : 'Yes, Accept Engagement'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirmModal(false)}
              disabled={verifying}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EngagementVerification;