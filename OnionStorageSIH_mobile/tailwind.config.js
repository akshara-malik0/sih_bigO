/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        gradient: "gradient 5s ease infinite",
      },
      fontFamily: {
        exo: ['"Exo"', "sans-serif"],
        oxanium: ['"Oxanium"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
