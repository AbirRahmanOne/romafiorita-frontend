import { defineConfig, devices } from '@playwright/test';

/**
 * E2E against the storefront running on MSW mocks (no backend). Run:
 *   pnpm exec playwright install  # once, to fetch browsers
 *   pnpm test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm --filter storefront dev',
    url: 'http://localhost:3000/en',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { NEXT_PUBLIC_USE_MOCKS: 'true' },
  },
});
