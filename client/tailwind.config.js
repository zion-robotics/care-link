export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "#1A6DB5",
          secondary: "#0FA3A3",
          dark: "#0D1F35",
        },
      },
    },
  },
  plugins: [],
}