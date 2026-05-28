/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          base: '#050505',
          surface: '#0A0A0A',
          elevated: '#111111',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        accent: {
          indigo: '#6366f1',
          violet: '#a855f7',
          glow: 'rgba(99, 102, 241, 0.15)',
        }
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
      }
    },
  },
  plugins: [],
}