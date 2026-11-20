/** Roma Fiorita storefront theme — pink editorial florist. Tailwind v3 preset. */
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#C2185B',
          300: '#F48FB1',
          700: '#A3134C',
          soft: '#FCE4EC',
        },
        bg: '#FFF7FA',
        surface: '#FFFFFF',
        ink: '#1d1b1a', // dark sections + footer
        text: '#3A1F2B',
        muted: '#6B4E5A',
        divider: '#F3D1DE',
        success: '#2E7D5B',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-body)', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: { md: '14px' },
      boxShadow: { md: '0 8px 30px rgba(58,31,43,0.08)' },
      maxWidth: { shell: '1320px' },
    },
  },
};
