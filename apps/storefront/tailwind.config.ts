import type { Config } from 'tailwindcss';
import storefrontPreset from '@rf/ui-tokens/storefront-preset';

export default {
  presets: [storefrontPreset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
