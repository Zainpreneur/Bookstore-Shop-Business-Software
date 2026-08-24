/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf7ef",
          100: "#f8ead4",
          200: "#efd2a8",
          300: "#e3b273",
          400: "#d68f47",
          500: "#c67328",
          600: "#a8591f",
          700: "#84421c",
          800: "#6c371d",
          900: "#5b2f1c",
        },
      },
      fontFamily: {
        serif: ["Georgia", "'Times New Roman'", "serif"],
      },
    },
  },
  plugins: [],
};
