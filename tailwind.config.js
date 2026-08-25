/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette sampled directly from the UI recording and the TripleA logo.
        brand: {
          DEFAULT: '#EF4423',
          50: '#FFF1ED',
          100: '#FFDDD3',
          200: '#FFC1AF',
          300: '#FF9A7E',
          400: '#F76D4B',
          500: '#EF4423',
          600: '#D83516',
          700: '#B32912',
          800: '#8E2413',
          900: '#742317',
        },
        navy: {
          DEFAULT: '#0A1028',
          50: '#E8EAF1',
          600: '#111A3A',
          700: '#0D1430',
          800: '#0A1028',
          900: '#050511',
        },
        // Semantic tokens — resolved from CSS variables so light/dark swap at runtime.
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-alt': 'rgb(var(--c-surface-alt) / <alpha-value>)',
        card: 'rgb(var(--c-card) / <alpha-value>)',
        header: 'rgb(var(--c-header) / <alpha-value>)',
        content: 'rgb(var(--c-text) / <alpha-value>)',
        muted: 'rgb(var(--c-text-muted) / <alpha-value>)',
        faint: 'rgb(var(--c-text-faint) / <alpha-value>)',
        line: 'rgb(var(--c-border) / <alpha-value>)',
        success: '#15975A',
        warning: '#F49A22',
        danger: '#DC2626',
        info: '#2563EB',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
        sheet: '24px',
        hero: '28px',
      },
      backgroundImage: {
        // Brand gradient used on hero banners and primary CTAs.
        'brand-hero':
          'linear-gradient(135deg, #FF6A3D 0%, #EF4423 42%, #D83516 100%)',
        'brand-hero-soft':
          'linear-gradient(135deg, #FFF1ED 0%, #FFDDD3 100%)',
      },
      boxShadow: {
        // Slightly heavier so white cards visibly float against cream surface.
        card: '0 2px 6px -2px rgb(10 16 40 / 0.08), 0 1px 3px -1px rgb(10 16 40 / 0.05)',
        'card-dark': '0 2px 8px -2px rgb(0 0 0 / 0.4)',
        sheet: '0 -8px 32px -12px rgb(10 16 40 / 0.28)',
        tabbar: '0 -1px 8px -4px rgb(10 16 40 / 0.08)',
      },
      spacing: {
        // Device safe areas, exposed by Ionic/Capacitor and the viewport-fit=cover meta.
        'safe-t': 'env(safe-area-inset-top)',
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-l': 'env(safe-area-inset-left)',
        'safe-r': 'env(safe-area-inset-right)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pill-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'pill-pulse': 'pill-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
