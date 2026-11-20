import type { Config } from 'tailwindcss';
import adminPreset from '@rf/ui-tokens/admin-preset';

export default {
  presets: [adminPreset],
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
