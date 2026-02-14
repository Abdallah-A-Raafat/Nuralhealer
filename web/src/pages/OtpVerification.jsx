import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  otpCode: yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
});

const OtpVerification = () => {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Get email from location state or query param
  const email = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    const result = await verifyOtp(data.email, data.otpCode);
    if (result.success) {
      navigate('/login');
    } else {
      setApiError(result.error);
    }
    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage('');
    setApiError('');
    const result = await resendOtp(email);
    if (result.success) {
      setResendMessage('New verification code sent to your email');
    } else {
      setApiError(result.error);
    }
    setIsResending(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify Your Email</h2>
        <p className="text-center mb-4">Enter the 6-digit code sent to your email</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            disabled={!!email}
          />
          <Input
            label="OTP Code"
            type="text"
            maxLength={6}
            {...register('otpCode')}
            error={errors.otpCode?.message}
          />
          {apiError && <div className="text-red-600">{apiError}</div>}
          {resendMessage && <div className="text-green-600">{resendMessage}</div>}
          <Button type="submit" loading={isLoading} className="w-full">Verify</Button>
        </form>
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={handleResend}
            loading={isResending}
            disabled={isResending}
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
