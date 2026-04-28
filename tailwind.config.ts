import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'serif'],
        body: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        gold:  { DEFAULT:'#F5C518', light:'#FFD94A', dark:'#C9A000' },
        navy:  { DEFAULT:'#0D1B3E', light:'#152347', mid:'#1A2D58', deep:'#080F22' },
        brand: { blue:'#2756CC', green:'#22C55E', red:'#EF4444', amber:'#F59E0B' },
      },
      keyframes: {
        fadeUp:      { from:{ opacity:'0', transform:'translateY(12px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideRight:  { from:{ transform:'translateX(100%)' }, to:{ transform:'translateX(0)' } },
        livePulse:   { '0%,100%':{ opacity:'1', transform:'scale(1)' }, '50%':{ opacity:'0.4', transform:'scale(0.8)' } },
        shimmer:     { from:{ backgroundPosition:'-200% center' }, to:{ backgroundPosition:'200% center' } },
      },
      animation: {
        'fade-up':    'fadeUp 0.35s ease-out',
        'slide-right':'slideRight 0.3s ease-out',
        'live-dot':   'livePulse 1.5s ease-in-out infinite',
        shimmer:      'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
