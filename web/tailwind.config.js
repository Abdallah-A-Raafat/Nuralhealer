/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NeuralHealer enhanced brand palette
        primary: '#9B59B6',          // Vibrant purple
        secondary: '#8E44AD',        // Rich violet
        accent: '#BB8FCE',           // Soft lilac
        background: '#F8F9FA',       // Clean white-gray
        backgroundDark: '#1A1625',   // Deep purple-black
        textPrimary: '#2C1A3F',      // Dark purple
        textSecondary: '#5D4E6D',    // Muted purple-gray
        lightText: '#ECE8F5',        // Soft white-lavender
        success: '#27AE60',          // Fresh green
        warning: '#F39C12',          // Warm orange
        error: '#E74C3C',            // Vibrant red
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
