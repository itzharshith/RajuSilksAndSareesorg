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
          blue: {
            DEFAULT: '#0B3C5D', // royal deep blue
            light: '#328CC1',
            dark: '#1D2731',
            deep: '#07111E',
            goldBorder: '#142E44',
          },
          creamText: {
            DEFAULT: '#E5DDC8', // elegant cream accent text
            light: '#F8F6F0',
            dark: '#B0A896',
            antique: '#C2B8A3',
            glow: '#FFFDF0',
          },
          cream: {
            DEFAULT: '#FDFBF7', // main luxury background
            dark: '#F5F2EB',
            light: '#FFFFFC',
          }
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'creamText-glow': '0 0 15px rgba(229, 221, 200, 0.35)',
        'blue-glow': '0 0 15px rgba(11, 60, 93, 0.15)',
        'luxury': '0 10px 30px -10px rgba(11, 60, 93, 0.1)',
      }
    },
  },
  plugins: [],
}
