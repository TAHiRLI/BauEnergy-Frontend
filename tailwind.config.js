/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html" ,"./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        highlight: {
          '0%, 100%': { backgroundColor: '#f9f9f9' },
          '50%': { backgroundColor: '#C8D8FA' },
        },
      },
      animation: {
        highlight: 'highlight 2s ease-in-out 3',
      },
    },
  },
}

