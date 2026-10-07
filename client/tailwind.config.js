/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ev: {
          blue: '#06B6D4',
          glow: '#22D3EE',
          dark: '#083344',
          red: '#EF4444',
          amber: '#F59E0B'
        },
        reg: {
          green: '#10B981',
          glow: '#34D399',
          dark: '#064E3B',
          gray: '#64748B'
        },
        dark: {
          950: '#030712',
          900: '#0B0F19',
          850: '#111827',
          800: '#1F2937',
          700: '#374151'
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'dash': 'dash 20s linear infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 2px rgba(6, 182, 212, 0.2))' }
        }
      }
    },
  },
  plugins: [],
}
