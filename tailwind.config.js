/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eefdf3',
          100: '#d6f9e1',
          200: '#b0f1c8',
          300: '#7ce4a9',
          400: '#42cf84',
          500: '#1db567',
          600: '#129253',
          700: '#107444',
          800: '#115c38',
          900: '#0f4b30',
          950: '#062a1a',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
