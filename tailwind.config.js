/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'google-blue': '#4285F4',
        'facebook-blue': '#1877F2',
        'linkedin-blue': '#0A66C2',
        'twitter-blue': '#1DA1F2',
        'tiktok-red': '#FF0050',
      },
    },
  },
  plugins: [],
}