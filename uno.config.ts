import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  theme: {
    colors: {
      kente: {
        gold: '#D4A017',
        'gold-light': '#E8C547',
        'gold-dark': '#A67C00',
      },
      terra: {
        DEFAULT: '#C75B39',
        light: '#E07B5A',
        dark: '#9A3F22',
      },
      adire: {
        DEFAULT: '#2E4A7A',
        light: '#4A6FA5',
        dark: '#1B2E4F',
      },
      baobab: {
        DEFAULT: '#2D6A4F',
        light: '#40916C',
        dark: '#1B4332',
      },
      surface: {
        DEFAULT: '#0d0d2b',
        raised: '#161638',
        overlay: '#1e1e45',
        card: 'rgba(22, 22, 56, 0.7)',
      },
      ink: {
        DEFAULT: '#F5F0E8',
        muted: '#B8B0A0',
        faint: '#6B6560',
      },
    },
    fontFamily: {
      display: ['Playfair Display', 'serif'],
      mono: ['JetBrains Mono', 'monospace'],
      body: ['Inter', 'sans-serif'],
    },
  },
  shortcuts: {
    'glass-card': 'bg-surface-card backdrop-blur-12 border border-white/8 rounded-2xl',
    'kente-border': 'border-l-3 border-kente-gold',
    'text-gradient': 'bg-gradient-to-r from-kente-gold via-terra to-adire-light bg-clip-text text-transparent',
    'btn-primary': 'bg-gradient-to-r from-kente-gold to-terra text-surface font-mono font-600 px-5 py-2.5 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:shadow-kente-gold/20 active:scale-97',
    'btn-ghost': 'bg-transparent border border-white/12 text-ink font-mono px-4 py-2 rounded-xl cursor-pointer transition-all hover:bg-white/5 hover:border-kente-gold/40',
  },
})
