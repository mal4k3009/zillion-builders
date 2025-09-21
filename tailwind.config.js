/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        'brand-gold': '#C8965F',
        'accent-gold': '#D4A574',
        'deep-charcoal': '#1A1A1A',
        'soft-black': '#2D2D2D',
        'pure-white': '#FFFFFF',
        'off-white': '#FAFAFA',
        'light-gray': '#E5E5E5',
        'medium-gray': '#666666',
        'dark-gray': '#3A4B5C',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      minHeight: {
        '44': '11rem',
      },
      maxHeight: {
        'screen-90': '90vh',
        'screen-80': '80vh',
      }
    },
  },
  plugins: [],
};
