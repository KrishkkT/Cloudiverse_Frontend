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
        'background': '#0E1117',  // Background
        'surface': '#161B22',     // Canvas
        'elevated': '#1F2937',    // Cards / Panels
        'border': '#2A3441',      // Borders
        
        // Accent Colors
        'primary': '#4F7CFF',     // Primary blue
        'secondary': '#22C55E',   // Secondary accent (success)
        'warning': '#F59E0B',     // Warning/variant B
        
        // Text Colors
        'text-primary': '#E5E7EB', // Primary text
        'text-secondary': '#9CA3AF', // Secondary text
        'text-subtle': '#6B7280',   // Subtle text
      },
    },
  },
  plugins: [],
}