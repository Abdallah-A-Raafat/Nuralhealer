import { useState } from 'react';
import Button from '../../components/common/Button';
import { useLanguage } from '../../hooks/useLanguage';

const DoctorAppointments = () => {
  const { t } = useLanguage();
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

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return t.doctor.appointments.confirmed;
      case 'pending':
        return t.doctor.appointments.pending;
      case 'cancelled':
        return t.doctor.appointments.cancelled;
      default:
        return status;
    }
  };

  const getTypeColor = (type) => {
    return type === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const getTypeText = (type) => {
    return type === 'Online' ? t.doctor.appointments.online : t.doctor.appointments.inPerson;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-textPrimary mb-2">{t.doctor.appointments.title}</h1>
          <p className="text-textSecondary">{t.doctor.appointments.description}</p>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-textPrimary">{t.doctor.appointments.patient}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-textPrimary">{t.doctor.appointments.dateTime}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-textPrimary">{t.doctor.appointments.type}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-textPrimary">{t.doctor.appointments.duration}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-textPrimary">{t.doctor.appointments.status}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-textPrimary">{t.doctor.appointments.actions}</th>
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
                        {getTypeText(appointment.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-textSecondary">{appointment.duration}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button className="text-primary hover:text-primary/80 font-medium">
                        {t.doctor.appointments.view}
                      </button>
                      <button className="text-secondary hover:text-secondary/80 font-medium">
                        {t.doctor.appointments.reschedule}
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
            <p className="text-textSecondary mb-4">{t.doctor.appointments.noAppointments}</p>
            <Button variant="primary">{t.doctor.appointments.scheduleAppointment}</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
