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
          50: '#fff5f2',
          100: '#ffe5d9',
          200: '#ffccb3',
          300: '#ffa87d',
          400: '#ff7a47',
          500: '#ff6b35',
          600: '#ff5722',
          700: '#e64a19',
          800: '#bf3e15',
          900: '#993212',
          DEFAULT: '#ff6b35',
          hover: '#ff5722',
        },
        orange: {
          50: '#fff5f2',
          100: '#ffe5d9',
          200: '#ffccb3',
          300: '#ffa87d',
          400: '#ff7a47',
          500: '#ff6b35',
          600: '#ff5722',
          700: '#e64a19',
        },
      },
    },
  },
  plugins: [],
}

