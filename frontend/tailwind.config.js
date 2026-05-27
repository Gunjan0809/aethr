/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#006BFF',
          lightBlue: '#E6F0FF',
          darkBlue: '#0052C4',
        }
      }
    },
  },
  plugins: [],
}