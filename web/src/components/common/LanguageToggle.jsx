import { useLanguage } from '../../hooks/useLanguage';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 rounded-md text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      aria-label="Toggle language"
    >
      {language === 'en' ? 'العربية' : 'English'}
    </button>
  );
};

export default LanguageToggle;
