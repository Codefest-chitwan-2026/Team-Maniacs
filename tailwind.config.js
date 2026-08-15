/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          500: '#334e68',
          800: '#102a43',
          900: '#0b1b2b',
          950: '#060d15',
        },
        emergency: {
          50: '#fef2f2',
          100: '#ffe1e1',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        warning: {
          50: '#fffbe6',
          500: '#f59e0b',
          600: '#d97706',
        },
        safe: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
        }
      },
    },
  },
  plugins: [],
};