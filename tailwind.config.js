/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      'trust-dark': '#0F3460',
      'trust-green': '#16A085',
      'trust-light': '#ECF0F1',
      'white': '#ffffff',
      'yellow-50': '#fefce8',
      'yellow-300': '#ffe02a',
      'yellow-400': '#fac800',
      'green-50': '#f0fdf4',
      'green-500': '#00c758',
      'green-600': '#00a544',
      'gray-300': '#d1d5dc',
      'gray-600': '#4a5565',
      'gray-700': '#364153',
      'transparent': 'transparent',
      'current': 'currentColor',
    },
    extend: {},
  },
  plugins: [],
};
