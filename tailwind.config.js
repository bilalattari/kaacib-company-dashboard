/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0f172a',
          DEFAULT: '#133260',
        },
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
          DEFAULT: '#FF3605',
        },
        kaacib: {
          primary: '#133260',
          secondary: '#FF3605',
          dark: '#0a1f3d',
          light: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'kaacib': '0 4px 20px rgba(19, 50, 96, 0.1)',
        'kaacib-lg': '0 10px 40px rgba(19, 50, 96, 0.15)',
      },
      backgroundImage: {
        'kaacib-gradient': 'linear-gradient(135deg, #133260 0%, #FF3605 100%)',
        'kaacib-primary': 'linear-gradient(135deg, #133260 0%, #133260 100%)',
        'kaacib-secondary': 'linear-gradient(135deg, #FF3605 0%, #FF3605 100%)',
      }
    },
  },
  plugins: [],
}
