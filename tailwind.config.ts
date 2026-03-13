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
        'bb-bg-primary': '#0a0a0f',
        'bb-bg-secondary': '#12121a',
        'bb-bg-tertiary': '#1a1a26',
        'bb-border': '#2a2a3a',
        'bb-text-primary': '#e8e8f0',
        'bb-text-secondary': '#8888a0',
        'bb-text-muted': '#555570',
        'bb-accent-orange': '#ff8c00',
        'bb-accent-blue': '#4488ff',
        'bb-green': '#00c853',
        'bb-red': '#ff1744',
        'bb-yellow': '#ffd600',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'price': ['14px', { fontWeight: '600' }],
        'label': ['11px', { fontWeight: '400', letterSpacing: '0.05em' }],
        'header': ['13px', { fontWeight: '700' }],
      },
    },
  },
  plugins: [],
}
export default config
