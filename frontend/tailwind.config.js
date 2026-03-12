/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0D1117',
        surface: '#161B22',
        hover: '#21262D',
        primary: '#E6EDF3',
        muted: '#8B949E',
        accent: {
          red: '#E94560',
          blue: '#58A6FF',
          green: '#3FB950',
          orange: '#F4A261',
        }
      }
    },
  },
  plugins: [],
}
