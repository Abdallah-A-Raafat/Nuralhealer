import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Sample past sessions data
  const [pastSessions] = useState([
    {
      id: 1,
      date: '2025-11-20',
      time: '2:00 PM',
      duration: '45 minutes',
      type: 'Text Session',
      emotion: 'Calm',
      notes: 'Discussed work-life balance and stress management techniques',
      mood_before: 'Anxious',
      mood_after: 'Relaxed',
    },
    {
      id: 2,
      date: '2025-11-18',
      time: '3:30 PM',
      duration: '50 minutes',
      type: 'Sound Session',
      emotion: 'Improved',
      notes: 'Voice session focusing on breathing exercises and mindfulness',
      mood_before: 'Stressed',
      mood_after: 'Calm',
    },
    {
      id: 3,
      date: '2025-11-15',
      time: '10:00 AM',
      duration: '45 minutes',
      type: 'Text Session',
      emotion: 'Positive',
      notes: 'Explored coping strategies for anxiety',
      mood_before: 'Worried',
      mood_after: 'Optimistic',
    },
    {
      id: 4,
      date: '2025-11-12',
      time: '4:00 PM',
      duration: '55 minutes',
      type: 'Text Session',
      emotion: 'Good',
      notes: 'Discussed goal-setting and personal development',
      mood_before: 'Neutral',
      mood_after: 'Motivated',
    },
    {
      id: 5,
      date: '2025-11-10',
      time: '2:15 PM',
      duration: '45 minutes',
      type: 'Sound Session',
      emotion: 'Improved',
      notes: 'Practiced meditation and relaxation techniques',
      mood_before: 'Tired',
      mood_after: 'Refreshed',
    },
    {
      id: 6,
      date: '2025-11-08',
      time: '11:00 AM',
      duration: '50 minutes',
      type: 'Text Session',
      emotion: 'Positive',
      notes: 'Initial assessment and treatment plan discussion',
      mood_before: 'Uncertain',
      mood_after: 'Hopeful',
    },
  ]);

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
          <h1 className="text-4xl font-bold text-textPrimary mb-2">Your Profile</h1>
          <p className="text-textSecondary">Manage your account and view your therapy journey</p>
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
              Account Overview
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'sessions'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Past Sessions
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Account Information Card */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">Account Information</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Side */}
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-textSecondary">Full Name</label>
                    <p className="text-lg font-medium text-textPrimary">{user?.firstName} {user?.lastName}</p>
                  </div>

                  <div>
                    <label className="text-sm text-textSecondary">Email Address</label>
                    <p className="text-lg font-medium text-textPrimary">{user?.email}</p>
                  </div>

                  <div>
                    <label className="text-sm text-textSecondary">Account Type</label>
                    <p className="inline-block mt-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                      Patient
                    </p>
                  </div>
                </div>

                {/* Right Side */}
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-textSecondary">Member Since</label>
                    <p className="text-lg font-medium text-textPrimary">November 26, 2025</p>
                  </div>

                  <div>
                    <label className="text-sm text-textSecondary">Account Status</label>
                    <p className="inline-block mt-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium text-sm">
                      Active
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-textSecondary">Verification Status</label>
                    <p className="inline-block mt-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium text-sm">
                      Verified
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <Button variant="outline" size="large">
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Therapy Progress Stats */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">Therapy Progress</h2>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">6</div>
                  <p className="text-sm text-textSecondary">Total Sessions</p>
                </div>

                <div className="text-center p-4 bg-secondary/5 rounded-lg">
                  <div className="text-3xl font-bold text-secondary mb-2">285</div>
                  <p className="text-sm text-textSecondary">Total Minutes</p>
                </div>

                <div className="text-center p-4 bg-accent/20 rounded-lg">
                  <div className="text-3xl font-bold text-accent mb-2">3</div>
                  <p className="text-sm text-textSecondary">Voice Sessions</p>
                </div>

                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">83%</div>
                  <p className="text-sm text-textSecondary">Mood Improvement</p>
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Recommended Next Steps</h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>✓ Schedule a session with a licensed professional</li>
                <li>✓ Try a voice session for a more natural conversation</li>
                <li>✓ Set personal therapy goals to track progress</li>
                <li>✓ Review your session notes regularly</li>
              </ul>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Sessions List */}
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
                              {new Date(session.date).toLocaleDateString()} at {session.time}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-textSecondary">Duration: {session.duration}</p>
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
                      <p className="text-sm text-textSecondary">
                        <strong>Session Notes:</strong> {session.notes}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4">
                      <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                        View Full Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <p className="text-sm text-textSecondary">Showing 6 of 6 sessions</p>
                <div className="space-x-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50" disabled>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">Notification Settings</h2>
              
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                  <div className="ml-4">
                    <p className="font-medium text-textPrimary">Session Reminders</p>
                    <p className="text-sm text-textSecondary">Get reminded before your scheduled sessions</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                  <div className="ml-4">
                    <p className="font-medium text-textPrimary">Email Updates</p>
                    <p className="text-sm text-textSecondary">Receive tips and wellness content</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="w-4 h-4 text-primary rounded" />
                  <div className="ml-4">
                    <p className="font-medium text-textPrimary">Marketing Emails</p>
                    <p className="text-sm text-textSecondary">Receive promotions and special offers</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">Privacy & Security</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-textPrimary">Change Password</p>
                    <p className="text-sm text-textSecondary">Update your account password</p>
                  </div>
                  <Button variant="outline" size="small">
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-textPrimary">Two-Factor Authentication</p>
                    <p className="text-sm text-textSecondary">Add extra security to your account</p>
                  </div>
                  <Button variant="outline" size="small">
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-textPrimary">Privacy Policy</p>
                    <p className="text-sm text-textSecondary">View our privacy and data practices</p>
                  </div>
                  <svg className="w-5 h-5 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-red-900 mb-4">Danger Zone</h2>
              <p className="text-red-800 text-sm mb-4">
                These actions are irreversible. Please proceed with caution.
              </p>
              <Button variant="danger" size="large">
                Delete Account
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
