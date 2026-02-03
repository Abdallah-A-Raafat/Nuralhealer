import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import LanguageToggle from './LanguageToggle';
import DarkModeToggle from './DarkModeToggle';
import NotificationBell from './NotificationBell';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import { useDarkMode } from '../../hooks/useDarkMode';
import navLogo from '../../assets/nav-logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoggedIn, accountType, logoutUser } = useAuth();
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();
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
    <nav className={`shadow-md border-b transition-all duration-300 ${
      isDarkMode 
        ? 'bg-[#241D30] border-[#3F3651]' 
        : 'bg-[#FFFFFF] border-purple-200'
    }`}>
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
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  item.current
                    ? isDarkMode
                      ? 'text-[#E5DEFF] bg-gradient-to-r from-primary/30 to-purple-900/40 shadow-sm ring-1 ring-primary/40'
                      : 'text-primary bg-gradient-to-r from-primary/15 to-purple-100/60 shadow-sm ring-1 ring-primary/20'
                    : isDarkMode
                      ? 'text-[#C5B8D9] hover:text-[#E5DEFF] hover:bg-gradient-to-r hover:from-purple-900/30 hover:to-purple-800/20 hover:shadow-sm'
                      : 'text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/40 hover:shadow-sm'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <DarkModeToggle />
            <LanguageToggle />
            {isLoggedIn && <NotificationBell />}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className={`flex flex-col items-end px-3 py-2 rounded-lg bg-gradient-to-r ${
                  isDarkMode 
                    ? 'from-purple-900/40 to-purple-800/30' 
                    : 'from-purple-50 to-purple-100/40'
                }`}>
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-[#E5DEFF]' : 'text-gray-700'
                  }`}>
                    {t.common.welcome}, {user?.firstName || 'User'}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className={`transition-colors ${
                    isDarkMode
                      ? 'hover:bg-red-900/20 hover:text-red-400'
                      : 'hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  {t.common.logout}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button 
                    variant="ghost"
                    className={isDarkMode 
                      ? 'hover:bg-purple-900/30 text-[#C5B8D9] hover:text-[#E5DEFF]'
                      : 'hover:bg-purple-50'
                    }
                  >
                    {t.common.signIn}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    className={`shadow-md hover:shadow-lg transition-all ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-purple-600 to-primary hover:from-purple-600/90 hover:to-primary/90'
                        : 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90'
                    }`}
                  >
                    {t.common.getStarted}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-colors focus:outline-none ${
                isDarkMode
                  ? 'text-[#C5B8D9] hover:text-primary hover:bg-purple-900/30'
                  : 'text-gray-700 hover:text-primary hover:bg-purple-50'
              }`}
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
            <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t transition-all duration-300 rounded-b-lg ${
              isDarkMode
                ? 'bg-gradient-to-b from-[#241D30] to-[#1a1625] border-[#3F3651]'
                : 'bg-gradient-to-b from-white to-purple-50/20 border-purple-100'
            }`}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all ${
                    item.current
                      ? isDarkMode
                        ? 'text-[#E5DEFF] bg-gradient-to-r from-primary/30 to-purple-900/40 shadow-sm'
                        : 'text-primary bg-gradient-to-r from-primary/15 to-purple-100/60 shadow-sm'
                      : isDarkMode
                        ? 'text-[#C5B8D9] hover:text-[#E5DEFF] hover:bg-gradient-to-r hover:from-purple-900/30 hover:to-purple-800/20'
                        : 'text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/40'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Auth */}
              <div className={`pt-4 border-t ${isDarkMode ? 'border-[#3F3651]' : 'border-purple-100'}`}>
                <div className="px-3 py-2 pb-3 flex items-center space-x-2">
                  <DarkModeToggle />
                  <LanguageToggle />
                </div>
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className={`px-3 py-2 rounded-lg font-medium ${
                      isDarkMode 
                        ? 'text-[#E5DEFF] bg-purple-900/40' 
                        : 'text-gray-700 bg-purple-50'
                    }`}>
                      {t.common.welcome}, {user?.firstName || 'User'}
                    </div>
                    <button
                      onClick={handleLogout}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                        isDarkMode
                          ? 'text-red-400 hover:bg-red-900/20'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      {t.common.logout}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                        isDarkMode
                          ? 'text-[#C5B8D9] hover:text-[#E5DEFF] hover:bg-purple-900/30'
                          : 'text-gray-700 hover:text-primary hover:bg-purple-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t.common.signIn}
                    </Link>
                    <Link
                      to="/register"
                      className={`block px-3 py-2 rounded-lg text-base font-medium text-white shadow-md transition-all ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-purple-600 to-primary'
                          : 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90'
                      }`}
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
