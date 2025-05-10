// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // Include all source files in src
      "./public/index.html", // Include the main HTML file
    ],
    theme: {
      extend: {}, // Add custom theme extensions if needed
    },
    plugins: [], // Add plugins if needed
  };