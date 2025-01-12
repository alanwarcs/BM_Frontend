/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arial', 'sans-serif'], // Set Arial as the default sans-serif font
      },
      colors: {
        customSecondary: '#9B9B9B',
        customPrimary: '#014C93',
        customPrimaryHover: '#1564AE',

        // customSecondary: '#feebdb',
        // customPrimary: '#006d77',
        // customPrimaryHover: '#00808c',
      },
      height: {
        'screen-minus-80': 'calc(100vh - 80px)',
      },
    },
  },
  plugins: [],
}
