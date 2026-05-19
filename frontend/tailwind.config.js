/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        card: 'rgba(20, 20, 30, 0.6)',
        border: 'rgba(0, 229, 255, 0.2)',
        primary: {
          DEFAULT: '#00e5ff',
          glow: 'rgba(0, 229, 255, 0.5)',
        },
        secondary: {
          DEFAULT: '#9d00ff',
          glow: 'rgba(157, 0, 255, 0.5)',
        },
        danger: {
          DEFAULT: '#ff2a2a',
          glow: 'rgba(255, 42, 42, 0.5)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-gradient': 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(157,0,255,0.1) 100%)',
      },
    },
  },
  plugins: [],
}
