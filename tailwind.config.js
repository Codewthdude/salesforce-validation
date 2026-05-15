/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        salesforce: {
          blue: '#0070D2',
          green: '#4BBF6B',
          amber: '#FFB75D',
          red: '#C23934',
          gray: '#F3F2F2',
        },
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
