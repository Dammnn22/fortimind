/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Digital Moon Color Palette
        'digital-blue': '#38BDF8',
        'digital-purple': '#7C3AED',
        'digital-cyan': '#06B6D4',
        'digital-dark': '#0B0D17',
        'digital-secondary': '#161925',
        'digital-tertiary': '#1E2139',
        'digital-card': '#252842',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'typewriter': 'typewriter 1.5s steps(20) forwards',
        'blink-caret': 'blink-caret 0.75s step-end infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-out': 'fade-out 0.5s ease-out',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-in-up': 'slide-in-up 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.6s ease-out',
        'slide-in-left': 'slide-in-left 0.6s ease-out',
      },
      backdropBlur: {
        'xl': '20px',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(56, 189, 248, 0.4)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
        'digital': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #0B0D17 0%, #161925 25%, #1E2139 50%, #252842 100%)',
        'gradient-digital': 'linear-gradient(135deg, #38BDF8 0%, #7C3AED 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(37, 40, 66, 0.6) 0%, rgba(30, 33, 57, 0.4) 100%)',
      },
    },
  },
  plugins: [],
}
