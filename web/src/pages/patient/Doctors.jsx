import { useState } from 'react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const Doctors = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Sample doctor data - will be replaced with backend data
  const [doctors] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Mitchell',
      specialization: 'Clinical Psychology',
      experience: '12 years',
      rating: 4.9,
      reviews: 248,
      image: '👩‍⚕️',
      bio: 'Specializes in anxiety disorders and cognitive behavioral therapy.',
      availability: 'Mon-Fri, 9am-6pm',
      price: '$80/session',
      languages: ['English', 'Spanish'],
      qualification: 'Ph.D. in Clinical Psychology',
    },
    {
      id: 2,
      name: 'Dr. James Chen',
      specialization: 'Therapy & Counseling',
      experience: '8 years',
      rating: 4.8,
      reviews: 195,
      image: '👨‍⚕️',
      bio: 'Expert in depression treatment and life coaching.',
      availability: 'Mon-Sat, 10am-7pm',
      price: '$75/session',
      languages: ['English', 'Mandarin'],
      qualification: 'M.D. Psychiatry',
    },
    {
      id: 3,
      name: 'Dr. Emma Rodriguez',
      specialization: 'Child Psychology',
      experience: '10 years',
      rating: 4.7,
      reviews: 182,
      image: '👩‍⚕️',
      bio: 'Specializes in working with adolescents and families.',
      availability: 'Tue-Sat, 12pm-8pm',
      price: '$70/session',
      languages: ['English', 'Spanish', 'Portuguese'],
      qualification: 'Ph.D. in Child Psychology',
    },
    {
      id: 4,
      name: 'Dr. Michael Park',
      specialization: 'PTSD & Trauma',
      experience: '15 years',
      rating: 4.95,
      reviews: 312,
      image: '👨‍⚕️',
      bio: 'Experienced trauma specialist using EMDR therapy.',
      availability: 'Mon-Fri, 8am-5pm',
      price: '$90/session',
      languages: ['English', 'Korean', 'Japanese'],
      qualification: 'M.D. Psychiatry, EMDR Certified',
    },
    {
      id: 5,
      name: 'Dr. Lisa Thompson',
      specialization: 'Relationship Counseling',
      experience: '9 years',
      rating: 4.85,
      reviews: 215,
      image: '👩‍⚕️',
      bio: 'Specializes in couples therapy and relationship issues.',
      availability: 'Mon-Thu, 2pm-8pm',
      price: '$85/session',
      languages: ['English', 'French'],
      qualification: 'Ph.D. in Counseling Psychology',
    },
    {
      id: 6,
      name: 'Dr. Ahmed Hassan',
      specialization: 'Stress Management',
      experience: '11 years',
      rating: 4.78,
      reviews: 201,
      image: '👨‍⚕️',
      bio: 'Expert in mindfulness-based stress reduction techniques.',
      availability: 'Tue-Sat, 9am-6pm',
      price: '$72/session',
      languages: ['English', 'Arabic', 'French'],
      qualification: 'Ph.D. in Clinical Psychology',
    },
  ]);

  const handleBookSession = (doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-textPrimary mb-4">Our Doctors</h1>
          <p className="text-lg text-textSecondary">
            Connect with our experienced and certified mental health professionals
          </p>
        </div>

        {/* Filters (Optional) */}
        <div className="max-w-6xl mx-auto mb-8 flex flex-wrap gap-3 justify-center">
          <button className="px-4 py-2 rounded-full bg-white text-textPrimary border border-primary hover:bg-primary/10 transition-colors text-sm font-medium">
            All Specializations
          </button>
          <button className="px-4 py-2 rounded-full bg-white text-textSecondary border border-gray-300 hover:border-primary transition-colors text-sm font-medium">
            Highest Rated
          </button>
          <button className="px-4 py-2 rounded-full bg-white text-textSecondary border border-gray-300 hover:border-primary transition-colors text-sm font-medium">
            Available Today
          </button>
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              {/* Doctor Header */}
              <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white text-center">
                <div className="text-5xl mb-3">{doctor.image}</div>
                <h2 className="text-xl font-bold mb-1">{doctor.name}</h2>
                <p className="text-sm text-white/90">{doctor.specialization}</p>
              </div>

              {/* Doctor Info */}
              <div className="p-6 space-y-4">
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
                  <span className="text-sm font-medium text-textPrimary">{doctor.rating}</span>
                  <span className="text-xs text-textSecondary">({doctor.reviews} reviews)</span>
                </div>

                {/* Experience */}
                <div className="text-sm">
                  <p className="text-textSecondary">Experience</p>
                  <p className="font-medium text-textPrimary">{doctor.experience}</p>
                </div>

                {/* Bio */}
                <p className="text-sm text-textSecondary line-clamp-2">{doctor.bio}</p>

                {/* Availability */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-900 font-medium">Available</p>
                  <p className="text-xs text-blue-800">{doctor.availability}</p>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-primary text-lg">{doctor.price}</span>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleBookSession(doctor)}
                  >
                    Book Session
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Modal */}
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          title={selectedDoctor ? `Book Session with ${selectedDoctor.name}` : 'Book Session'}
          size="medium"
        >
          {selectedDoctor && (
            <div className="space-y-4">
              {/* Doctor Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{selectedDoctor.image}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-textPrimary">{selectedDoctor.name}</h3>
                    <p className="text-sm text-textSecondary">{selectedDoctor.specialization}</p>
                    <p className="text-sm text-textSecondary mt-1">Qualification: {selectedDoctor.qualification}</p>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    Select Time
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>-- Select Time --</option>
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
                    Session Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Online (Video Call)</option>
                    <option>In-Person</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Any specific concerns you'd like to discuss..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-accent/10 border border-accent rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-textPrimary font-medium">Total Cost:</span>
                  <span className="text-lg font-bold text-primary">{selectedDoctor.price}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  className="flex-1"
                >
                  Confirm Booking
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsBookingModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-textSecondary text-center">
                You will receive a confirmation email with meeting details
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Doctors;
