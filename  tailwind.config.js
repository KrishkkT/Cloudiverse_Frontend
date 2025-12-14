/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#1E1E2F',
        'sky-blue': '#3B82F6',
        'emerald-green': '#22C55E',
        'dark-slate': '#2A2A3C',
        'off-white': '#F8FAFC'
      }
    },
  },
  plugins: [],
}