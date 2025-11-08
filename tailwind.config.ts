import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d6f0ff',
          200: '#aee0ff',
          300: '#7ecaff',
          400: '#4db0ff',
          500: '#1f96ff',
          600: '#0f78db',
          700: '#0c5dad',
          800: '#0a4987',
          900: '#0a3b6e',
        }
      }
    },
  },
  plugins: [],
}

export default config
