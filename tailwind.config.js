/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f8',
          100: '#fde6f1',
          200: '#fccce3',
          300: '#faa3cf',
          400: '#f670b0',
          500: '#E84499',
          600: '#d12680',
          700: '#b01867',
          800: '#921557',
          900: '#7a164b',
        },
        dark: '#1E1E1E',
      },
    },
  },
  plugins: [],
}
