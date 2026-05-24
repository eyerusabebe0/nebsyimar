/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#ebe1d4',
          300: '#d4c4a8',
          400: '#bda67c',
          500: '#a68b5b',
          600: '#8b7049',
          700: '#5c4a30',
          800: '#1a1a2e',
          900: '#0f0f1a',
          950: '#0a0a12',
        },
        accent: {
          50: '#fdf8eb',
          100: '#f9ecc8',
          200: '#f3d88f',
          300: '#e8c05a',
          400: '#d4a853',
          500: '#c9963e',
          600: '#b07a2a',
          700: '#8b5e1f',
          800: '#6b4718',
          900: '#4a3010',
        },
        cream: {
          50: '#fefcf9',
          100: '#faf7f2',
          200: '#f5f0e8',
          300: '#ede4d6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        engraved: ['"Cinzel Decorative"', '"Cinzel"', '"IM Fell English SC"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
