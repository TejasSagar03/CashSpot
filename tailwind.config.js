/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <-- This is the magic line we need!
  content: [
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};