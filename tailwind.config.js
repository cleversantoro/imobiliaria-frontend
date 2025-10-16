/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#f59e0b',
          dark: '#b45309',
          light: '#fcd34d',
        },
        surface: {
          DEFAULT: '#0f172a',
          muted: '#1e293b',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
        body: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        card: '0 20px 45px -20px rgba(15, 23, 42, 0.35)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          md: '2rem',
        },
      },
    },
  },
  plugins: [],
};
