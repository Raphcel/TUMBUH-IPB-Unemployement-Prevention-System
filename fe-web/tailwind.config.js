/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f2854',  // Primary Brand Blue
          light: '#2a4a82',    // Lighter shade for hover
          dark: '#071630',     // Dark shade for active
          muted: '#eef2f6',    // Very light background accent
        },
        surface: {
          DEFAULT: '#ffffff',  // Standard white card/bg
          elevated: '#fcfcfd', // Slightly off-white for raised elements
          muted: '#f9fafb',    // Gray backs
          border: '#e5e7eb',   // Subtle borders
        },
        text: {
          DEFAULT: '#111827',  // High contrast primary text
          muted: '#6b7280',    // Secondary text
          light: '#9ca3af',    // Placeholder or tertiary
          inverse: '#ffffff',  // White text on dark bg
        },
        // Kept for backward compatibility where not yet refactored
        primary: '#0f2854',
        secondary: '#727272',
        highlight: '#bde8f5',
        accent: '#6f819b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to right, #071630, #0f2854)',
        'gradient-light': 'linear-gradient(to right, #fcfcfd, #f9fafb)',
      }
    },
  },
  plugins: [],
};
