import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const patientSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9+-]+$/, 'Please enter a valid phone number'),
  dateOfBirth: yup
    .string()
    .required('Date of birth is required'),
  medicalCondition: yup
    .string()
    .optional(),
});

const DoctorPatients = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0101',
      dateOfBirth: '1990-05-15',
      condition: 'Anxiety Disorder',
      lastVisit: '2025-11-20',
      status: 'active',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@email.com',
      phone: '+1-555-0102',
      dateOfBirth: '1988-03-22',
      condition: 'Depression',
      lastVisit: '2025-11-19',
      status: 'active',
    },
    {
      id: 3,
      name: 'Emma Wilson',
      email: 'emma.w@email.com',
      phone: '+1-555-0103',
      dateOfBirth: '1995-07-08',
      condition: 'PTSD',
      lastVisit: '2025-11-15',
      status: 'active',
    },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(patientSchema),
  });

  const handleAddPatient = (data) => {
    const newPatient = {
      id: patients.length + 1,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      condition: data.medicalCondition || 'Not specified',
      lastVisit: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    setPatients([...patients, newPatient]);
    reset();
    setIsAddModalOpen(false);
  };

  const handleViewProfile = (patient) => {
    // This will be implemented later with a patient detail page
    console.log('View profile:', patient);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Add Patient Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-textPrimary mb-2">My Patients</h1>
            <p className="text-textSecondary">Manage your patient list and profiles</p>
          </div>
          <Button
            variant="primary"
            size="large"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Patient
          </Button>
        </div>

        {/* Patients Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <div key={patient.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-textPrimary">{patient.name}</h3>
                  <p className="text-sm text-textSecondary">{patient.condition}</p>
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {patient.status}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center text-textSecondary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {patient.email}
                </div>
                <div className="flex items-center text-textSecondary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948-.684l1.498-4.493a1 1 0 011.502-.684l1.498 4.493a1 1 0 00.948.684H19a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                  </svg>
                  {patient.phone}
                </div>
                <div className="flex items-center text-textSecondary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Last visit: {patient.lastVisit}
                </div>
              </div>

              <button
                onClick={() => handleViewProfile(patient)}
                className="w-full py-2 px-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>

        {/* Add Patient Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Patient"
          size="medium"
        >
          <form className="space-y-4" onSubmit={handleSubmit(handleAddPatient)}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="First name"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                placeholder="Last name"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="Email address"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              placeholder="+1-555-0000"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Date of Birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />

            <Input
              label="Medical Condition (Optional)"
              placeholder="e.g., Anxiety Disorder"
              error={errors.medicalCondition?.message}
              {...register('medicalCondition')}
            />

            {/* 2FA Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Two-factor authentication will be enabled for added patients in a future update.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Add Patient
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default DoctorPatients;
