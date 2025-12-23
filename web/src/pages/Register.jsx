import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage.jsx';

const schema = yup.object({
  accountType: yup
    .string()
    .required('Please select an account type')
    .oneOf(['patient', 'doctor'], 'Invalid account type'),
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
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'You must agree to the terms and conditions'),
});

const Register = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      accountType: 'patient',
    },
  });

  const accountType = watch('accountType');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');

    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, agreeToTerms, ...userData } = data;
    
    const result = await registerUser(userData);

    if (result.success) {
      // Navigate based on account type
      navigate(userData.accountType === 'doctor' ? '/doctor-dashboard' : '/chat');
    } else {
      setApiError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-textPrimary">
          {t.auth.register}
        </h2>
        <p className="mt-2 text-center text-sm text-textSecondary">
          {t.auth.registerSubtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {apiError}
              </div>
            )}

            {/* Account Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-textPrimary">
                {t.auth.selectAccountType}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  accountType === 'patient' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value="patient"
                    {...register('accountType')}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="ml-2 font-medium text-textPrimary">{t.common.patient}</span>
                </label>

                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  accountType === 'doctor' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value="doctor"
                    {...register('accountType')}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="ml-2 font-medium text-textPrimary">{t.common.doctor}</span>
                </label>
              </div>
              {errors.accountType && (
                <p className="text-sm text-red-600">{errors.accountType.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.common.firstName}
                type="text"
                placeholder="First name"
                required
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label={t.common.lastName}
                type="text"
                placeholder="Last name"
                required
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label={t.common.email}
              type="email"
              placeholder="Enter your email"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label={t.common.password}
              type="password"
              placeholder="Create a password"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label={t.common.confirmPassword}
              type="password"
              placeholder="Confirm your password"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="flex items-center">
              <input
                id="agree-terms"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                {...register('agreeToTerms')}
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-textPrimary">
                {t.common.agreeToTerms}
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
            )}

            <Button
              type="submit"
              size="large"
              loading={isLoading}
              className="w-full mt-6 bg-gray-100"
              variant="ghost"
            >
              {t.auth.register}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t.common.haveAccount}</span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/login">
                <Button variant="ghost" size="large" className="w-full bg-gray-100">
                  {t.common.signIn}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
