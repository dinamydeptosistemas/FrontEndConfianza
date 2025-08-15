/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          500: '#667eea',
          600: '#5a6fd6',
        },
        purple: {
          600: '#764ba2',
          
        },
        secondary: '#f3f4f6', // Color para bg-secondary
        primary: '#1e4e9c',   // Color para bg-primary
        card: '#ffffff',      // Color para bg-card
      },
    fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}