/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          400: "#f5c842",
          500: "#C9A84C",
          600: "#B8952A",
          700: "#9A7A1E",
        },
        noir: {
          900: "#121212",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        accent: ["'Cinzel'", "serif"],
      },
    },
  },
  plugins: [],
};
