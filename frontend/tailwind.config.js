/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f0ff',
          100: '#e4e4ff',
          200: '#cdcdff',
          300: '#a8a8ff',
          400: '#7c7cff',
          500: '#5b5bef',
          600: '#4242d8',
          700: '#3434b8',
          800: '#2c2c95',
          900: '#272775',
          950: '#18184a',
        },
        surface: {
          900: '#0a0a14',
          800: '#0f0f1f',
          700: '#14142a',
          600: '#1a1a35',
          500: '#212145',
          400: '#2a2a58',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        glow:    { '0%': { boxShadow: '0 0 5px rgba(91,91,239,0.3)' }, '100%': { boxShadow: '0 0 20px rgba(91,91,239,0.7)' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
