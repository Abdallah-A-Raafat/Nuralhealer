import { useState } from 'react';
import Button from '../../components/common/Button';

const DoctorAppointments = () => {
  const [appointments] = useState([
    {
      id: 1,
      patientName: 'Sarah Johnson',
      date: '2025-11-27',
      time: '10:00 AM',
      status: 'confirmed',
      type: 'Online',
      duration: '1 hour',
    },
    {
      id: 2,
      patientName: 'Michael Chen',
      date: '2025-11-27',
      time: '2:00 PM',
      status: 'confirmed',
      type: 'In-Person',
      duration: '1 hour',
    },
    {
      id: 3,
      patientName: 'Emma Wilson',
      date: '2025-11-28',
      time: '11:00 AM',
      status: 'pending',
      type: 'Online',
      duration: '45 minutes',
    },
    {
      id: 4,
      patientName: 'David Martinez',
      date: '2025-11-28',
      time: '3:30 PM',
      status: 'confirmed',
      type: 'In-Person',
      duration: '1 hour',
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    return type === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-textPrimary mb-2">Appointments</h1>
          <p className="text-textSecondary">Manage your upcoming and past appointments</p>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-textPrimary">Patient</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-textPrimary">Date & Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-textPrimary">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-textPrimary">Duration</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-textPrimary">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-textPrimary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-textPrimary font-medium">{appointment.patientName}</td>
                    <td className="px-6 py-4 text-sm text-textSecondary">
                      <div>{appointment.date}</div>
                      <div>{appointment.time}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                        {appointment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-textSecondary">{appointment.duration}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button className="text-primary hover:text-primary/80 font-medium">
                        View
                      </button>
                      <button className="text-secondary hover:text-secondary/80 font-medium">
                        Reschedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No appointments message */}
        {appointments.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-textSecondary mb-4">No appointments scheduled</p>
            <Button variant="primary">Schedule Appointment</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
