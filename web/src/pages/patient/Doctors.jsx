import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useLanguage } from '../../hooks/useLanguage';
import apiClient from '../../services/apiClient';
import engagementService from '../../services/engagementService';
import { showToast } from '../../utils/toast';

const Doctors = () => {
  const { t } = useLanguage();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('our-doctors'); // 'our-doctors' or 'all-doctors'
  const [isEngagementModalOpen, setIsEngagementModalOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [nearestDoctor, setNearestDoctor] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Fetch doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get('/doctors/lobby', {
          params: {
            page: 0,
            size: 50,
            sortBy: 'rating',
            sortDirection: 'desc'
          }
        });
        setDoctors(response.data.content || []);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err.message || 'Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);


  const handleBookSession = (doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  const handleSendEngagementRequest = (doctor) => {
    setSelectedDoctor(doctor);
    setIsEngagementModalOpen(true);
  };

  const handleConfirmEngagement = async () => {
    if (!selectedDoctor) return;
    
    try {
      const doctorUserId = selectedDoctor.userId || selectedDoctor.id;
      await engagementService.initiatePatientEngagement(doctorUserId, 'FULL_ACCESS');
      
      showToast.success(
        t.patient?.doctors?.engagementSentSuccess || 'Engagement request sent successfully! The doctor will review and verify your request.',
        { duration: 5000 }
      );
      
      setIsEngagementModalOpen(false);
      setSelectedDoctor(null);
      
    } catch (error) {
      console.error('Failed to send engagement request:', error);
      showToast.error(
        t.patient?.doctors?.engagementSentError || error.response?.data?.message || 'Failed to send engagement request. Please try again.',
        { duration: 5000 }
      );
    }
  };

  const findNearestDoctor = () => {
    setLocationError('');
    setNearestDoctor(null);

    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation not supported on this device.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        // Backend proximity search not ready; pick top-rated doctor as a stand-in
        if (doctors.length === 0) {
          setLocationError('No doctors available yet.');
        } else {
          const fallback = [...doctors].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
          setNearestDoctor(fallback);
        }
        setLocating(false);
      },
      (err) => {
        setLocationError(err.message || 'Unable to access location.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-textPrimary mb-4">{t.patient.doctors.title}</h1>
          <p className="text-lg text-textSecondary">
            {t.patient.doctors.description}
          </p>
        </div>

        {/* Tabs: Our Doctors vs All Doctors */}
        <div className="max-w-6xl mx-auto mb-8 flex justify-center">
          <div className="inline-flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setActiveTab('our-doctors')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'our-doctors'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              {t.patient.doctors.ourDoctors || 'Our Doctors'}
            </button>
            <button
              onClick={() => setActiveTab('all-doctors')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'all-doctors'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              {t.patient.doctors.allDoctors || 'All Doctors'}
            </button>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
              <p className="text-textSecondary">Loading doctors...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-textPrimary mb-2">Failed to load doctors</h3>
              <p className="text-textSecondary mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State - Our Doctors */}
          {!loading && !error && activeTab === 'our-doctors' && doctors.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">👨‍⚕️</div>
              <h3 className="text-xl font-semibold text-textPrimary mb-2">
                {t.patient.doctors.noDoctorsYet || 'No Registered Doctors Yet'}
              </h3>
              <p className="text-textSecondary">
                {t.patient.doctors.checkBackSoon || 'Check back soon for registered doctors'}
              </p>
            </div>
          )}
          
          {/* All Doctors (frontend-only nearest doctor placeholder) */}
          {!loading && !error && activeTab === 'all-doctors' && (
            <div className="col-span-full text-center py-12 flex flex-col items-center gap-4">
              <div className="text-6xl">🏥</div>
              <h3 className="text-xl font-semibold text-textPrimary">
                {t.patient.doctors.allDoctors || 'All Doctors'}
              </h3>
              <p className="text-textSecondary max-w-2xl">
                {t.patient.doctors.allDoctorsDescription || 'Find a nearby doctor. Location search will use real proximity once backend data is ready.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Button variant="primary" onClick={findNearestDoctor} disabled={locating}>
                  {locating ? 'Locating…' : 'Find Nearest Doctor'}
                </Button>
                <span className="text-sm text-textSecondary">(Uses your location; provisional selection until backend proximity is live)</span>
              </div>
              {locationError && (
                <div className="text-sm text-red-600">{locationError}</div>
              )}
              {nearestDoctor && (
                <div className="mt-4 w-full max-w-md bg-white rounded-lg shadow p-6 text-left">
                  <p className="text-sm text-textSecondary mb-2">Suggested doctor (temporary)</p>
                  <h4 className="text-lg font-semibold text-textPrimary">{nearestDoctor.fullName}</h4>
                  <p className="text-sm text-textSecondary">{nearestDoctor.specialization || nearestDoctor.title || 'General Practitioner'}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="primary" size="small" onClick={() => handleBookSession(nearestDoctor)}>
                      Book
                    </Button>
                    <Button variant="outline" size="small" onClick={() => handleSendEngagementRequest(nearestDoctor)}>
                      Request Engagement
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Doctor Cards Grid - Only show when activeTab is 'our-doctors' and doctors exist */}
          {!loading && !error && activeTab === 'our-doctors' && doctors.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Doctor Header */}
                  <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white text-center">
                    {doctor.profilePictureThumbnailUrl ? (
                      <img 
                        src={doctor.profilePictureThumbnailUrl} 
                        alt={doctor.fullName}
                        className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-white"
                      />
                    ) : (
                      <div className="text-5xl mb-3">👨‍⚕️</div>
                    )}
                    <h2 className="text-xl font-bold mb-1">{doctor.fullName}</h2>
                    <p className="text-sm text-white/90">{doctor.title || doctor.specialization}</p>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-6 space-y-4">
                    {/* Specialization and Verification */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">{doctor.specialization}</span>
                      {doctor.isVerified && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-textPrimary">{doctor.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-xs text-textSecondary">({doctor.totalReviews || 0} {t.patient.doctors.reviews})</span>
                    </div>

                    {/* Experience */}
                    <div className="text-sm">
                      <p className="text-textSecondary">{t.patient.doctors.experience}</p>
                      <p className="font-medium text-textPrimary">{doctor.yearsOfExperience}+ years</p>
                    </div>

                    {/* Location */}
                    {doctor.location && (
                      <div className="text-sm">
                        <p className="text-textSecondary">📍 {doctor.location}</p>
                      </div>
                    )}

                    {/* Availability Status */}
                    <div className={`rounded-lg p-3 ${
                      doctor.availabilityStatus === 'online' ? 'bg-green-50' :
                      doctor.availabilityStatus === 'busy' ? 'bg-yellow-50' : 'bg-gray-50'
                    }`}>
                      <p className={`text-xs font-medium ${
                        doctor.availabilityStatus === 'online' ? 'text-green-900' :
                        doctor.availabilityStatus === 'busy' ? 'text-yellow-900' : 'text-gray-900'
                      }`}>
                        {doctor.availabilityStatus === 'online' ? '🟢 Available' :
                         doctor.availabilityStatus === 'busy' ? '🟡 Busy' : '⚫ Offline'}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-textSecondary">Consultation Fee</span>
                        <span className="font-bold text-primary text-lg">${doctor.consultationFee || '0'}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleSendEngagementRequest(doctor)}
                          className="flex-1 text-xs"
                        >
                          {t.patient.doctors.sendEngagement || 'Engage'}
                        </Button>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleBookSession(doctor)}
                          className="flex-1"
                        >
                          {t.patient.doctors.bookSession}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Modal */}
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          title={selectedDoctor ? `${t.patient.doctors.bookSessionWith} ${selectedDoctor.fullName}` : t.patient.doctors.bookSession}
          size="medium"
        >
          {selectedDoctor && (
            <div className="space-y-4">
              {/* Doctor Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {selectedDoctor.profilePictureThumbnailUrl ? (
                    <img 
                      src={selectedDoctor.profilePictureThumbnailUrl} 
                      alt={selectedDoctor.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-3xl">👨‍⚕️</div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-textPrimary">{selectedDoctor.fullName}</h3>
                    <p className="text-sm text-textSecondary">{selectedDoctor.specialization}</p>
                    <p className="text-sm text-textSecondary mt-1">{selectedDoctor.title}</p>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    {t.patient.doctors.selectDate}
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    {t.patient.doctors.selectTime}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>-- {t.patient.doctors.selectTime} --</option>
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>02:00 PM</option>
                    <option>03:00 PM</option>
                    <option>04:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    {t.patient.doctors.sessionType}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>{t.patient.doctors.online}</option>
                    <option>{t.patient.doctors.inPerson}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    {t.patient.doctors.notesOptional}
                  </label>
                  <textarea
                    placeholder={t.patient.doctors.notesPlaceholder}
                    dir="rtl"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-accent/10 border border-accent rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-textPrimary font-medium">{t.patient.doctors.totalCost}:</span>
                  <span className="text-lg font-bold text-primary">${selectedDoctor.consultationFee || '0'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  className="flex-1"
                >
                  {t.patient.doctors.confirmBooking}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsBookingModalOpen(false)}
                >
                  {t.common.cancel}
                </Button>
              </div>

              <p className="text-xs text-textSecondary text-center">
                {t.patient.doctors.confirmationNote}
              </p>
            </div>
          )}
        </Modal>

        {/* Engagement Request Modal */}
        <Modal
          isOpen={isEngagementModalOpen}
          onClose={() => setIsEngagementModalOpen(false)}
          title={t.patient.doctors.sendEngagementRequest || 'Send Engagement Request'}
          size="medium"
        >
          {selectedDoctor && (
            <div className="space-y-4">
              {/* Doctor Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {selectedDoctor.profilePictureThumbnailUrl ? (
                    <img 
                      src={selectedDoctor.profilePictureThumbnailUrl} 
                      alt={selectedDoctor.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-3xl">👨‍⚕️</div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-textPrimary">{selectedDoctor.fullName}</h3>
                    <p className="text-sm text-textSecondary">{selectedDoctor.specialization}</p>
                    <p className="text-sm text-textSecondary mt-1">{selectedDoctor.title}</p>
                  </div>
                </div>
              </div>

              {/* Engagement Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {t.patient.doctors.whatIsEngagement || 'What is an Engagement?'}
                </h4>
                <p className="text-sm text-blue-800">
                  {t.patient.doctors.engagementDescription || 
                    'An engagement request allows you to establish a professional relationship with this doctor. Once accepted, the doctor will have access to your health records and can provide ongoing care.'}
                </p>
              </div>

              {/* Confirmation Message */}
              <div className="space-y-2">
                <p className="text-sm text-textPrimary">
                  {t.patient.doctors.engagementConfirmMessage || 
                    'Are you sure you want to send an engagement request to this doctor?'}
                </p>
                <p className="text-xs text-textSecondary">
                  {t.patient.doctors.engagementNote || 
                    'The doctor will be notified and can accept or decline your request.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleConfirmEngagement}
                >
                  {t.patient.doctors.sendRequest || 'Send Request'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEngagementModalOpen(false)}
                >
                  {t.common.cancel}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Doctors;
