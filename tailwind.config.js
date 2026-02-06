/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cinema-dark': '#0a0a0c',
        'cinema-accent': '#ff0055',
      },
    },
  },
  plugins: [],
}
