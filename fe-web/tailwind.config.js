/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1a8754',
          light: '#22a96a',
          dark: '#146c43',
          muted: '#e8f5e9',
        },
        navy: {
          DEFAULT: '#0b1c2d',
          light: '#0f2854',
        },
        surface: {
          DEFAULT: '#ffffff',
          elevated: '#fcfcfd',
          muted: '#f9fafb',
          border: '#e5e7eb',
        },
        text: {
          DEFAULT: '#111827',
          muted: '#6b7280',
          light: '#9ca3af',
          inverse: '#ffffff',
        },
        // Legacy compatibility
        primary: '#1a8754',
        secondary: '#6b7280',
        highlight: '#bbf7d0',
        accent: '#22a96a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to right, #0b1c2d, #0f2854)',
        'gradient-brand': 'linear-gradient(to right, #146c43, #1a8754)',
      },
      keyframes: {
        scroll: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        scroll: 'scroll 30s linear infinite',
      },
    },
  },
  plugins: [],
};
