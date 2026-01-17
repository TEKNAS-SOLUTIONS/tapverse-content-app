/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tapverse Orange Theme (matching logo - #ff4f00)
        orange: {
          50: '#fff4f0',
          100: '#ffe5db',
          200: '#ffccb7',
          300: '#ffa880',
          400: '#ff8049',
          500: '#ff4f00', // Primary orange - exact logo color
          600: '#e64700',
          700: '#cc3f00',
          800: '#b33700',
          900: '#992f00',
        },
        // Apple-inspired neutral grays
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Light background colors
        background: {
          primary: '#ffffff',
          secondary: '#fafafa',
          tertiary: '#f5f5f5',
        },
        // Text colors
        text: {
          primary: '#1d1d1f',
          secondary: '#6e6e73',
          tertiary: '#86868b',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'apple': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'apple-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '18px',
      },
    },
  },
  plugins: [],
}
