/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zen: {
          bg: {
            dark: '#080D1A',
            darkSurface: '#0E1626',
            darkCard: '#141E33',
            darkBorder: '#1E2B47',
            light: '#F8FAFC',
            lightSurface: '#FFFFFF',
            lightCard: '#F1F5F9',
            lightBorder: '#E2E8F0',
          },
          accent: {
            cyan: '#06B6D4',
            cyanHover: '#0891B2',
            indigo: '#6366F1',
            violet: '#8B5CF6',
            emerald: '#10B981',
          },
          text: {
            darkPrimary: '#F8FAFC',
            darkSecondary: '#94A3B8',
            darkMuted: '#64748B',
            lightPrimary: '#0F172A',
            lightSecondary: '#475569',
            lightMuted: '#94A3B8',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  plugins: [],
}
