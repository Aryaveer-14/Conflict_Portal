/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Courier Prime"', 'monospace'],
        mono: ['"Courier Prime"', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      colors: {
        base: '#000000',
        surface: '#0a0a0a',
        hover: '#1a1a1a',
        primary: '#ffffff',
        muted: '#888888',
        accent: {
          red: '#ff3333',
          blue: '#00ff41',
          green: '#00ff41',
          orange: '#F4A261',
        }
      }
    },
  },
  plugins: [],
}
