import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [],
  theme: {
    extend: {
      colors: {
        // Placeholder mint-themed palette — swap for real brand colors later
        mint: {
          50: '#eefdf6',
          100: '#d6fbe8',
          200: '#aef4d2',
          300: '#78e8b6',
          400: '#43d495',
          500: '#1fb87b',
          600: '#149463',
          700: '#137751',
          800: '#135f42',
          900: '#124e38'
        }
      }
    }
  },
  plugins: []
}
