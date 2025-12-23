import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const DoctorDashboard = () => {
  const stats = [
    {
      label: 'Total Patients',
      value: '24',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'Appointments This Week',
      value: '8',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Sessions Completed',
      value: '156',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const recentActivities = [
    { patient: 'Sarah Johnson', action: 'Completed therapy session', time: '2 hours ago' },
    { patient: 'Michael Chen', action: 'Scheduled new appointment', time: '4 hours ago' },
    { patient: 'Emma Wilson', action: 'Submitted progress notes', time: 'Yesterday' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-textPrimary mb-2">Welcome back, Doctor</h1>
          <p className="text-textSecondary">Here's your practice overview</p>
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
          <h2 className="text-xl font-bold text-textPrimary mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/doctor-appointments">
              <Button variant="outline" size="large" className="w-full">
                View Appointments
              </Button>
            </Link>
            <Link to="/doctor-patients">
              <Button variant="outline" size="large" className="w-full">
                Manage Patients
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-textPrimary mb-4">Recent Activity</h2>
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
    </div>
  );
};

export default DoctorDashboard;
