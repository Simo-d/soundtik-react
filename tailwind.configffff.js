/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: '#6200EA',
          'primary-light': '#9d46ff',
          'primary-dark': '#0a00b6',
          secondary: '#03DAC6',
          success: '#00C853',
          error: '#B00020',
        },
      },
    },
    plugins: [],
  }