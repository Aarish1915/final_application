/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Inter"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#235A5D',
          light: '#2D7275',
          dark: '#1A4547',
          50: '#F0F7F7',
          100: '#DCF0F0',
        },
      },
    },
  },
  plugins: [],
};
