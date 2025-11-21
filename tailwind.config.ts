import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Structural Palette
        'void-black': '#0B0C10',
        'abyssal-blue': '#161722',
        'gunmetal': '#25273C',
        'text-white': '#E4E5F1',
        'muted-steel': '#A0A3BD',
        
        // Signal Palette
        'growth-green': '#00E396',
        'correction-red': '#FF4560',
        'neutral-amber': '#FEB019',
        'signal-violet': '#7D5FFF',
        'data-blue': '#008FFB',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
        serif: ['var(--font-merriweather)', 'Merriweather', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
