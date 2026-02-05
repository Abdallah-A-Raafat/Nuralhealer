import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage.jsx';
import appIcon from '../assets/icon.png';

const schema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  subject: yup
    .string()
    .required('Subject is required'),
  message: yup
    .string()
    .required('Message is required')
    .min(10, 'Message must be at least 10 characters'),
});

const AboutContact = () => {
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/chat');
    } else {
      navigate('/register');
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // TODO: Replace with actual API call when backend is ready
    // await contactService.sendMessage(data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Contact form data:', data);
    setIsSubmitted(true);
    reset();
    setIsSubmitting(false);
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-lightText">{t.about.aboutNeuralHealer}</h1>
          <p className="text-xl max-w-3xl mx-auto text-lightText">
            {t.about.empoweringMentalHealth}
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-textPrimary mb-8 text-center">
            {t.about.ourMission}
          </h2>
          <p className="text-lg text-textSecondary leading-relaxed mb-8">
            {t.about.missionText}
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-textPrimary mb-12 text-center">
            {t.about.whatMakesUsDifferent}
          </h2>
        
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-textPrimary mb-3">{t.about.aiPoweredSupport}</h3>
              <p className="text-textSecondary">
                {t.about.aiPoweredSupportDesc}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-textPrimary mb-3">{t.about.privacyFirst}</h3>
              <p className="text-textSecondary">
                {t.about.privacyFirstDesc}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-textPrimary mb-3">{t.about.professionalNetwork}</h3>
              <p className="text-textSecondary">
                {t.about.professionalNetworkDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-textPrimary mb-12 text-center">
          {t.about.ourTeam}
        </h2>
        
        <div className="grid md:grid-cols-4 gap-16 mx-auto">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
              <a href="https://github.com/MohamedAchraf22" target="_blank" rel="noopener noreferrer">
                <span className="text-textPrimary font-bold text-2xl">M</span>
              </a>
            </div>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">Mohamed Ashraf</h3>
            <p className="text-secondary font-medium mb-2">Machine Learning Engineer</p>
            <p className="text-textSecondary text-sm">
              Designing, training, and deploying ML models to solve real-world problems.
            </p>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
              <a href="https://github.com/Abdallah-A-Raafat" target="_blank" rel="noopener noreferrer">
                <span className="text-textPrimary font-bold text-2xl">A</span>
              </a>
            </div>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">Abdallah Ahmed</h3>
            <p className="text-secondary font-medium mb-2">Frontend Developer</p>
            <p className="text-textSecondary text-sm">
              Creating intuitive user interfaces with React and modern web technologies.
            </p>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
              <a href="https://github.com/MariamRaafatMohamed" target="_blank" rel="noopener noreferrer">
                <span className="text-textPrimary font-bold text-2xl">M</span>
              </a>
            </div>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">Mariam Raafat</h3>
            <p className="text-secondary font-medium mb-2">AI Engineer</p>
            <p className="text-textSecondary text-sm">
              Aspiring data scientist with a passion for AI, machine learning, and impactful storytelling through data.
            </p>
          </div>
    
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
              <a href="https://github.com/dolamasa1" target="_blank" rel="noopener noreferrer">
                <span className="text-textPrimary font-bold text-2xl">A</span>
              </a>
            </div>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">Ahmed Adel</h3>
            <p className="text-secondary font-medium mb-2">Backend Developer</p>
            <p className="text-textSecondary text-sm">
              Specializing in .NET development and AI integration for robust backend systems.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-textPrimary mb-4">{t.contact.contactUs}</h2>
            <p className="text-xl text-textSecondary max-w-3xl mx-auto">
              {t.contact.hereToHelp}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-bold text-textPrimary mb-8">
                {t.contact.getInTouch}
              </h3>
              <p className="text-lg text-textSecondary mb-8">
                {t.contact.haveQuestions}
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent bg-opacity-30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-textPrimary">{t.contact.emailSupport}</h4>
                    <p className="text-textSecondary">support@neuralhealer.com</p>
                    <p className="text-sm text-textSecondary">{t.contact.responseTime}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent bg-opacity-30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-textPrimary">{t.contact.officeLocation}</h4>
                    <p className="text-textSecondary">Cairo, Egypt</p>
                    <p className="text-sm text-textSecondary">Graduation Project - Faculty of Computer Science</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-textPrimary">Response Time</h4>
                    <p className="text-textSecondary">24/7 AI Support Available</p>
                    <p className="text-sm text-textSecondary">Human support: Mon-Fri, 9 AM - 6 PM EET</p>
                  </div>
                </div>
              </div>

              {/* Emergency Notice */}
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">Emergency Support</h4>
                    <p className="text-sm text-red-700 mt-1">
                      If you're experiencing a mental health emergency, please contact your local emergency services 
                      or crisis hotline immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-textPrimary mb-6">{t.contact.contactForm}</h3>
              
              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-800 font-medium">
                      {t.contact.successMessage}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label={t.contact.name}
                  type="text"
                  placeholder="Enter your full name"
                  required
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label={t.common.email}
                  type="email"
                  placeholder="Enter your email"
                  required
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label={t.contact.subject}
                  type="text"
                  placeholder="What is this regarding?"
                  required
                  error={errors.subject?.message}
                  {...register('subject')}
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {t.contact.message} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="6"
                    placeholder="Tell us how we can help you..."
                    className="w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:border-gray-400"
                    {...register('message')}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="large"
                  loading={isSubmitting}
                  className="w-full"
                >
                  {t.common.submit}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-lightText flex items-center justify-center gap-1">
            <img src={appIcon} alt="NeuralHealer icon" className="h-4 w-4 md:h-5 md:w-5 object-contain" />
            {t.home.readyToStart}
          </h2>
          <p className="text-xl text-lightText mb-8 max-w-2xl mx-auto">
            {t.home.takeFirstStep}
          </p>
          <Button variant="secondary" size="large" onClick={handleGetStarted}>
            {t.common.getStarted}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutContact;
