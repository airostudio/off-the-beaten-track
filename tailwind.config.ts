import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a1128',
          900: '#0f1a3c',
          800: '#16225a',
          700: '#1e2f74',
        },
        accent: {
          500: '#ff6b4a',
          600: '#e8542f',
        },
        member: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,26,60,0.04), 0 8px 24px rgba(15,26,60,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
