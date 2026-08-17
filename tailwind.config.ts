/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E50914', // Movie Red
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#222222',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F5C518', // Rotten Tomatoes Yellow
          foreground: '#000000',
        },
        background: {
          DEFAULT: '#0A0A0A',
          foreground: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#1A1A1A',
          foreground: '#FFFFFF',
        },
      },
      spacing: {
        '4px': '4px',
        '8px': '8px',
        '12px': '12px',
        '16px': '16px',
        '24px': '24px',
        '32px': '32px',
      },
      screens: {
        'obile': '375px',
        'desktop': '1280px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.5rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
      },
    },
  },
  plugins: [],
};
