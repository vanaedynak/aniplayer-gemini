/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        animix: {
          dark: '#0B0E14',
          card: '#121620',
          cardHover: '#181E2B',
          panel: '#151A26',
          border: 'rgba(255, 255, 255, 0.08)',
          borderActive: 'rgba(139, 92, 246, 0.5)',
          purple: '#8B5CF6',
          purpleDark: '#6D28D9',
          purpleLight: '#A78BFA',
          neon: '#A855F7',
          grayText: '#9CA3AF',
          dimText: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(139, 92, 246, 0.35)',
        'neon-strong': '0 0 30px rgba(168, 85, 247, 0.6)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};
