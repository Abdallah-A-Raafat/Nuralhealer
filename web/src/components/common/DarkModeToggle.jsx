import { useDarkMode } from '../../hooks/useDarkMode';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        // Sun icon (for light mode)
        <svg
          className="w-5 h-5 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.83-2.83a1 1 0 00-1.414 1.414l2.83 2.83a1 1 0 001.414-1.414zM2.05 6.464a1 1 0 000 1.414l2.83-2.83a1 1 0 00-1.414-1.414L2.05 6.464zm5.657-9.193a1 1 0 00-1.414 0l-2.83 2.83a1 1 0 001.414 1.414l2.83-2.83a1 1 0 000-1.414zm9.193 9.193a1 1 0 000-1.414l-2.83 2.83a1 1 0 001.414 1.414l2.83-2.83zM10 18a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4-4a1 1 0 100 2h.01a1 1 0 100-2H6zm8 0a1 1 0 100 2h.01a1 1 0 100-2h-.01z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        // Moon icon (for dark mode)
        <svg
          className="w-5 h-5 text-gray-700"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

export default DarkModeToggle;
