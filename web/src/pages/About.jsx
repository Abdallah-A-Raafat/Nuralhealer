import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage.jsx';
import appIcon from '../assets/icon.png';

const About = () => {
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/chat');
    } else {
      navigate('/register');
    }
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
            What Makes Us Different
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
        
        <div className="grid md:grid-cols-4 gap-16  mx-auto">
    
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
          </div> {/*Mohamed Ashraf */} 

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
          </div> {/*Abdallah Ahmed */} 

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
          </div> {/*mariam Raafat */} 
    
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
          </div> {/*Ahmed Adel */} 

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

export default About;
