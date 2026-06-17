/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        shipwise: {
          teal: "#1D7874",
          yellow: "#F4D35E",
          orange: "#EE964B",
          dark: "#262626",
          navy: "#1A1B4B",
          cyan: "#00D9FF",
          lavender: "#C9B6E4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
