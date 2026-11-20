/** Roma Fiorita admin theme — blue/white dashboard. Tailwind v3 preset. */
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '#f5f7fb',
        surface: '#ffffff',
        card: '#e6e9f0', // border
        text: '#111827',
        muted: '#6b7280',
        sidebar: '#111827',
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4fd0',
          100: '#eaf1fe',
        },
        // status pill palette (bg/fg pairs live in the Pill component)
        status: {
          amber: '#b45309',
          'amber-bg': '#fff4e5',
          blue: '#1d4ed8',
          'blue-bg': '#eaf1fe',
          violet: '#6d28d9',
          'violet-bg': '#ede9fe',
          sky: '#0369a1',
          'sky-bg': '#e0f2fe',
          green: '#15803d',
          'green-bg': '#dcfce7',
          red: '#b91c1c',
          'red-bg': '#fee2e2',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '12px' },
    },
  },
};
