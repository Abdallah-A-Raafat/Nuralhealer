import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage.jsx';
import appIcon from '../assets/icon.png';

const Home = () => {
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();

  return (
  <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4">
        {/* Hero Card */}
        <div className="relative overflow-hidden max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8 md:p-12 shadow-lg">
          {/* soft glow */}
          <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 w-72 h-72 rounded-full bg-secondary/20 blur-3xl" />
          {/* subtle pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.5) 1px, transparent 0)'
            , backgroundSize: '18px 18px'}}
          />

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-textPrimary mb-4 flex items-center justify-center gap-0">
            <img src={appIcon} alt="NeuralHealer icon" className="h-6 w-6 md:h-50 md:w-50 object-contain" />
            <span className="-ml-1">
              {t.home.welcomeToNeuralHealer}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-textSecondary mb-8 leading-relaxed max-w-3xl mx-auto">
            {t.home.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isLoggedIn ? (
              <Link to="/chat">
                <Button size="large" variant="ghost" className="w-full sm:w-auto bg-accent/20 transition-transform duration-200 hover:scale-[1.02]">
                  Start Therapy Session
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register" >
                  <Button variant="ghost" size="large" className="w-full sm:w-auto transition-transform duration-200 hover:scale-[1.02]">
                    {t.common.getStarted}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" size="large" className="w-full sm:w-auto transition-transform duration-200 hover:scale-[1.02]">
                    {t.common.signIn}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-textPrimary mb-12">
          {t.home.howNeuralHealerHelps}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow duration-200 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">{t.home.voiceInteraction}</h3>
            <p className="text-textSecondary">
              {t.home.voiceInteractionDesc}
            </p>
          </div>

          <div className="group bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow duration-200 text-center">
            <div className="w-16 h-16 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">{t.home.emotionDetection}</h3>
            <p className="text-textSecondary">
              {t.home.emotionDetectionDesc}              Our AI analyzes your emotional state and provides personalized support and coping strategies.
            </p>
          </div>

          <div className="group bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow duration-200 text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">{t.home.professionalConnection}</h3>
            <p className="text-textSecondary">
              {t.home.professionalConnectionDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="rounded-xl bg-white shadow-md p-6 text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-primary">10k+</div>
            <div className="mt-1 text-sm text-textSecondary">{t.home.sessionsCompleted}</div>
          </div>
          <div className="rounded-xl bg-white shadow-md p-6 text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-secondary">4.9/5</div>
            <div className="mt-1 text-sm text-textSecondary">{t.home.userSatisfaction}</div>
          </div>
          <div className="rounded-xl bg-white shadow-md p-6 text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-accent">24/7</div>
            <div className="mt-1 text-sm text-textSecondary">{t.home.alwaysOnSupport}</div>
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
          <p className="text-xl text-textSecondary mb-8">
            {t.home.takeFirstStep}
          </p>
          {!isLoggedIn && (
            <Link to="/register">
              <Button variant="secondary" size="large">
                {t.common.createAccount}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
