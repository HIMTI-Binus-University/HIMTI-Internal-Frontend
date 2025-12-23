/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eeff6",
          100: "#c4cce4",
          200: "#a8b4d7",
          300: "#8091c5",
          400: "#677cb9",
          500: "#415ba8",
          600: "#3b5399",
          700: "#2e4177",
          800: "#24325c",
          900: "#1b2647",
        },
        grayscale: {
          50: "#f8f8f8",
          100: "#eaeaea",
          200: "#e0e0e0",
          300: "#d1d1d1",
          400: "#c9c9c9",
          500: "#bbbbbb",
          600: "#aaaaaa",
          700: "#858585",
          800: "#676767",
          900: "#4f4f4f",
        },
      },
      fontFamily: {
        sans: ["Public Sans", "sans-serif"],
      },
      fontSize: {
        h1: ["61px", { lineHeight: "92px", fontWeight: "400", letterSpacing: "0%" }],
        h2: ["49px", { lineHeight: "74px", fontWeight: "400", letterSpacing: "0%" }],
        h3: ["39px", { lineHeight: "59px", fontWeight: "400", letterSpacing: "0%" }],
        h4: ["31px", { lineHeight: "47px", fontWeight: "400", letterSpacing: "0%" }],
        h5: ["25px", { lineHeight: "38px", fontWeight: "400", letterSpacing: "0%" }],
        h6: ["20px", { lineHeight: "30px", fontWeight: "400", letterSpacing: "0%" }],
        "body-1": ["16px", { lineHeight: "24px", fontWeight: "400", letterSpacing: "0%" }],
        "body-2": ["13px", { lineHeight: "20px", fontWeight: "400", letterSpacing: "0%" }],
        "body-3": ["10px", { lineHeight: "15px", fontWeight: "400", letterSpacing: "0%" }],
      },
    },
  },
  plugins: [],
};
