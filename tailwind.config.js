/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': "url('/images/backg.jpg')",
        'footer-texture': "url('/images/backg.jpg')",
      }
    },
  },
  plugins: [],
}
