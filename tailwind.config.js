/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          500: '#5ea578',
          600: '#4e8d64',
        },
        slate: {
          100: '#eef2f6',
          200: '#d9e2ec',
          300: '#bccad9',
          400: '#94a4b8',
        }
      }
    },
  },
  plugins: [],
}
