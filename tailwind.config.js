/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'trust-dark': '#0F3460',
        'trust-green': '#16A085',
        'trust-light': '#ECF0F1',
      },
      animation: {
        spin: 'spin 0.8s linear infinite',
      },
      keyframes: {
        spin: {
          'to': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
