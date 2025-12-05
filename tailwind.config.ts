import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0072bc',
          50: '#e6f3fa',
          100: '#cce7f5',
          200: '#99cfeb',
          300: '#66b7e1',
          400: '#339fd7',
          500: '#0072bc',
          600: '#005b96',
          700: '#004471',
          800: '#002d4b',
          900: '#001626',
        },
      },
    },
  },
  plugins: [],
}
export default config





