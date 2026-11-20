import { expect, test } from '@playwright/test';

// Addendum: "admin creates a custom request → customer pays on /pay → order appears as paid."
// The admin-create half runs in the Vite app (separate server); here we cover the public,
// storefront-side half against a seeded payment-request token (RF-2026-24790 / pay_demotoken123).

test('public pay page shows the agreed order and total', async ({ page }) => {
  await page.goto('/en/pay/pay_demotoken123');
  await expect(page.getByText('RF-2026-24790')).toBeVisible();
  await expect(page.getByText(/84/)).toBeVisible(); // €84.00 agreed total
  await expect(page.getByText(/stripe/i)).toBeVisible(); // "Payments processed by Stripe" trust note
});

test('pay page is noindex and excluded from the sitemap', async ({ page, request }) => {
  await page.goto('/en/pay/pay_demotoken123');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).not.toContain('pay_demotoken123');
});

test('verify page confirms a genuine order by number + email', async ({ page }) => {
  await page.goto('/en/verify');
  await page.getByLabel(/order number/i).fill('RF-2026-24790');
  await page.getByLabel(/email/i).fill('sofia.greco@mail.com');
  await page.getByRole('button', { name: /verify|check/i }).click();
  await expect(page.getByText(/genuine/i)).toBeVisible();
  await expect(page.getByText(/84/)).toBeVisible(); // confirmed amount €84.00
});
