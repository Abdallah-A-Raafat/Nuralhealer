import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import LanguageToggle from './LanguageToggle';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import navLogo from '../../assets/nav-logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoggedIn, accountType, logoutUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  // Patient navigation
  const patientNav = [
    { name: t.common.home, href: '/', current: location.pathname === '/' },
    { name: t.common.about, href: '/about', current: location.pathname === '/about' },
    { name: t.common.contact, href: '/contact', current: location.pathname === '/contact' },
    ...(isLoggedIn && accountType === 'patient' ? [
      { name: t.navigation.chat, href: '/chat', current: location.pathname === '/chat' },
      { name: t.navigation.doctors, href: '/booking', current: location.pathname === '/booking' },
      { name: t.navigation.profile, href: '/profile', current: location.pathname === '/profile' },
    ] : []),
  ];

  // Doctor navigation
  const doctorNav = [
    { name: t.navigation.dashboard, href: '/doctor-dashboard', current: location.pathname === '/doctor-dashboard' },
    { name: t.navigation.appointments, href: '/doctor-appointments', current: location.pathname === '/doctor-appointments' },
    { name: t.navigation.myPatients, href: '/doctor-patients', current: location.pathname === '/doctor-patients' },
  ];

  const navigation = isLoggedIn && accountType === 'doctor' ? doctorNav : patientNav;

  return (
    <nav className="bg-white dark:bg-[#241D30] shadow-lg dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.4)] transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-15">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={navLogo}
              alt="NeuralHealer logo"
              className="h-4 md:h-30 w-auto object-contain block shrink-0"
            />
            <span className="sr-only">NeuralHealer</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current
                    ? 'text-primary bg-primary/10 dark:text-primary dark:bg-primary/20'
                    : 'text-textSecondary dark:text-[#C5B8D9] hover:text-primary hover:bg-accent/20 dark:hover:text-primary dark:hover:bg-accent/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <DarkModeToggle />
            <LanguageToggle />
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-textSecondary text-sm">
                    {t.common.welcome}, {user?.firstName || 'User'}
                  </span>
                </div>
                <Button variant="ghost" onClick={handleLogout}>
                  {t.common.logout}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost">{t.common.signIn}</Button>
                </Link>
                <Link to="/register">
                  <Button variant="ghost">{t.common.getStarted}</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-textSecondary hover:text-primary focus:outline-none focus:text-primary"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-[#241D30] border-t dark:border-[#3F3651] transition-colors duration-300">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    item.current
                      ? 'text-primary bg-primary/10 dark:text-primary dark:bg-primary/20'
                      : 'text-textSecondary dark:text-[#C5B8D9] hover:text-primary hover:bg-accent/20 dark:hover:text-primary dark:hover:bg-accent/10'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Auth */}
              <div className="pt-4 border-t border-accent/30 dark:border-[#3F3651]">
                <div className="px-3 py-2 pb-3 flex items-center space-x-2">
                  <DarkModeToggle />
                  <LanguageToggle />
                </div>
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-textSecondary dark:text-[#C5B8D9]">
                      {t.common.welcome}, {user?.firstName || 'User'}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-textPrimary dark:text-[#ECE8F5] hover:text-primary hover:bg-accent/20 dark:hover:text-primary dark:hover:bg-accent/10"
                    >
                      {t.common.logout}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-textPrimary dark:text-[#ECE8F5] hover:text-primary hover:bg-accent/20 dark:hover:text-primary dark:hover:bg-accent/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t.common.signIn}
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t.common.getStarted}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
