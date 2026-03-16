import { forwardRef, useState, useRef, useEffect } from 'react';

// Inject wave animation CSS only once, at module level
if (typeof window !== 'undefined' && !document.getElementById('wave-anim-style')) {
  const style = document.createElement('style');
  style.id = 'wave-anim-style';
  style.innerHTML = `
    .animate-wave {
      animation: waveText 0.7s cubic-bezier(.4,2,.6,1);
    }
    @keyframes waveText {
      0% { letter-spacing: 0.1em; transform: scaleY(1) rotate(-2deg); }
      20% { letter-spacing: 0.2em; transform: scaleY(1.2) rotate(2deg); }
      40% { letter-spacing: 0.1em; transform: scaleY(0.95) rotate(-2deg); }
      60% { letter-spacing: 0.15em; transform: scaleY(1.1) rotate(2deg); }
      80% { letter-spacing: 0.1em; transform: scaleY(1) rotate(-1deg); }
      100% { letter-spacing: 0.1em; transform: scaleY(1) rotate(0deg); }
    }
  `;
  document.head.appendChild(style);
}

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  // Wave animation state
  const [wave, setWave] = useState(false);
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed';
  const errorClasses = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 hover:border-gray-400';



  // Animation: scale and rotate on click
  const [iconAnim, setIconAnim] = useState(false);
  const handleToggle = () => {
    setIconAnim(true);
    setShowPassword((v) => {
      // If revealing password, trigger wave
      if (!v) {
        setWave(true);
        setTimeout(() => setWave(false), 700);
      }
      return !v;
    });
    setTimeout(() => setIconAnim(false), 250);
  };

  return (
    <div className="space-y-1 relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {isPassword ? (
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            placeholder={placeholder}
            disabled={disabled}
            className={`${baseClasses} ${errorClasses} ${className} pr-10 ${showPassword && wave ? 'animate-wave' : ''}`}
            autoComplete="current-password"
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={`${baseClasses} ${errorClasses} ${className}`}
            {...props}
          />
        )}

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={handleToggle}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-primary focus:outline-none"
            style={{
              transition: 'transform 0.25s cubic-bezier(.4,2,.6,1)',
              transform: iconAnim ? 'scale(1.2) rotate(20deg)' : 'scale(1) rotate(0deg)',
            }}
          >
            {showPassword ? (
              // Eye open SVG
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              // Eye closed SVG
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .512-.122.995-.338 1.418m-1.418-1.418A3 3 0 019.88 9.88zm8.12 2.12c-1.5 2.5-4.5 5.5-8 5.5-2.5 0-4.5-1.5-6-3.5M6.12 6.12C7.5 4.5 10.5 2.5 14 2.5c2.5 0 4.5 1.5 6 3.5" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
