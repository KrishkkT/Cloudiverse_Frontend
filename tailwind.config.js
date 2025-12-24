/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Global Style Palette
        'background-light': '#f6f6f8',
        'background-dark': '#101622',
        'card-dark': '#171E2B',
        'input-dark': '#0F131A',
        'border-dark': '#2E3645',
        'primary': '#2b6cee',

        // Mappings for existing app usage (aliasing to new palette where appropriate)
        'background': '#101622',
        'surface': '#171E2B',
        'elevated': '#1F2937',
        'border': '#2E3645',
        'secondary': '#22C55E',
        'warning': '#F59E0B',
        'text-primary': '#E5E7EB',
        'text-secondary': '#9CA3AF',
        'text-subtle': '#6B7280',
        "primary-hover": "#2563EB",
      },
    },
  },
  plugins: [],
}