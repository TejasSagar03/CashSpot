/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        tech: ['"Chakra Petch"', 'sans-serif'], 
      },
      transitionTimingFunction: {
        'nothing': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      transitionDuration: {
        '800': '800ms',
      }
    },
  },
  plugins: [],
};