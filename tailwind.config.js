/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      // ADD THIS: Custom "Nothing" Easing Curve
      transitionTimingFunction: {
        'nothing': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      // Optional: Add a custom duration for that high-inertia feel
      transitionDuration: {
        '800': '800ms',
      }
    },
  },
  plugins: [],
};