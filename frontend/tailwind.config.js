/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apsrtc: {
          primary: "#0F3E76",    // Official deep APSRTC blue
          primaryDark: "#0A2B52",
          secondary: "#1E7E34",  // Andhra green accent
          accent: "#D32F2F",     // Emergency / alert red
          light: "#F4F7FB",
          surface: "#FFFFFF",
          border: "#E2E8F0"
        }
      }
    },
  },
  plugins: [],
}
