/** @type {import('tailwindcss').Config} */
export default {
  content: ['./dashboard/index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#19344F',
        teal: '#31696D',
        green: '#5A9F68',
        canvas: '#F5F7F9',
        graphite: '#26333D',
        amber: '#C8872D',
        critical: '#BA3B44',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        quiet: '0 1px 2px rgba(25, 52, 79, 0.05)',
        drawer: '-12px 0 32px rgba(25, 52, 79, 0.12)',
      },
    },
  },
  plugins: [],
}
