import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — soft beauty (rose + lavender)
        rose: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843'
        },
        accent: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95'
        }
      },
      fontFamily: {
        display: ['Rubik', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Nunito Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(157, 23, 77, 0.06), 0 1px 3px rgba(157, 23, 77, 0.08)',
        'card-hover': '0 8px 16px -4px rgba(157, 23, 77, 0.16)',
        pop: '0 20px 25px -5px rgba(157, 23, 77, 0.15), 0 8px 10px -6px rgba(157, 23, 77, 0.1)'
      },
      backgroundImage: {
        'rose-gradient': 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
        'rose-soft-gradient': 'linear-gradient(135deg, #FDF2F8 0%, #F5F3FF 100%)'
      }
    }
  },
  plugins: []
}
