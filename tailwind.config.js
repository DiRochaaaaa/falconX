/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Apple-style Color System - Verde como cor principal
      colors: {
        falcon: {
          // Greens - Cor principal do FalconX
          50: '#f0fdf4',
          100: '#dcfce7', 
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80', // Light accent
          500: '#22c55e', // Primary
          600: '#16a34a', // Primary dark
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Semantic colors
        success: {
          DEFAULT: '#22c55e',
          light: '#86efac',
          dark: '#15803d'
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706'
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626'
        },
        info: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb'
        }
      },
      // Apple-style Typography
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'Roboto Mono',
          'Consolas',
          'monospace'
        ]
      },
      // Apple-style Spacing & Sizing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Refined Border Radius - Apple-style
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem', 
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'full': '9999px',
      },
      // Apple-style Shadows
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        // Custom Apple-style shadows
        'glow-sm': '0 0 20px rgba(34, 197, 94, 0.15)',
        'glow': '0 0 40px rgba(34, 197, 94, 0.2)',
        'glow-lg': '0 0 60px rgba(34, 197, 94, 0.25)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 197, 94, 0.1)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(34, 197, 94, 0.2)',
      },
      // Enhanced Animations
      animation: {
        // Apple-style smooth animations
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-gentle': 'pulseGentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(34, 197, 94, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      // Apple-style Backdrop Blur
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      // Gradient stops for modern effects
      gradientColorStops: {
        'falcon-gradient': {
          '0%': '#22c55e',
          '50%': '#16a34a', 
          '100%': '#15803d',
        }
      }
    },
  },
  plugins: [
    // Custom utilities plugin
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Glass effect utilities
        '.glass': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-strong': {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        },
        '.glass-green': {
          background: 'rgba(34, 197, 94, 0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
        },
        // Text gradients
        '.text-gradient': {
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-secondary': {
          background: 'linear-gradient(135deg, #86efac 0%, #22c55e 50%, #16a34a 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        // Background gradients
        '.bg-gradient-main': {
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)',
        },
        '.bg-gradient-green': {
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        },
        '.bg-gradient-green-light': {
          background: 'linear-gradient(135deg, #86efac 0%, #22c55e 100%)',
        },
        // Apple-style buttons
        '.btn-apple': {
          '@apply px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-falcon-500/30': {},
        },
        '.btn-primary': {
          '@apply btn-apple bg-gradient-to-r from-falcon-500 to-falcon-600 text-white shadow-lg shadow-falcon-500/25 hover:shadow-xl hover:shadow-falcon-500/40 hover:-translate-y-0.5': {},
        },
        '.btn-secondary': {
          '@apply btn-apple bg-falcon-500/10 text-falcon-400 border border-falcon-500/30 hover:bg-falcon-500/20 hover:border-falcon-500/50 hover:-translate-y-0.5': {},
        },
        '.btn-ghost': {
          '@apply btn-apple text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20 hover:-translate-y-0.5': {},
        },
        // Apple-style cards
        '.card': {
          '@apply rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-card transition-all duration-300': {},
        },
        '.card-hover': {
          '@apply hover:shadow-card-hover hover:-translate-y-1 hover:border-falcon-500/30': {},
        },
        // Input styles
        '.input-apple': {
          '@apply w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-falcon-500/30 focus:border-falcon-500/50': {},
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
}
