/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f2854', // Dark blue (authority, headers, key actions)
        secondary: '#727272', // Dark grey (secondary text, subtle UI elements)
        highlight: '#bde8f5', // Light blue (background sections, highlights)
        accent: '#6f819b', // Blue-grey (secondary accents, gradients)
        white: '#ffffff', // White (primary background, content clarity)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
         'gradient-dark': 'linear-gradient(to right, #0f2854, #727272)',
         'gradient-light': 'linear-gradient(to right, #bde8f5, #6f819b)',
      }
    },
  },
  plugins: [],
};
