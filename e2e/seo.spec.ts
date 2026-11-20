import { expect, test } from '@playwright/test';

test('robots.txt allows the AI + search crawlers and links the sitemap', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toContain('Googlebot');
  expect(body).toContain('Claude-SearchBot');
  expect(body).toContain('Sitemap: https://romafiorita.com/sitemap.xml');
});

test('sitemap.xml lists localised SEO routes with both locales', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('https://romafiorita.com/en/flower-delivery-rome');
  expect(xml).toContain('https://romafiorita.com/it/consegna-fiori-roma');
  expect(xml).toContain('/it/consegna-fiori/milano'); // city, localised slug
  // pay/verify must never appear in the sitemap
  expect(xml).not.toContain('/pay/');
  expect(xml).not.toContain('/verify');
});

test('home renders in both locales', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('h1').first()).toBeVisible();
  await page.goto('/it');
  await expect(page.locator('h1').first()).toBeVisible();
});

test('SEO landing pages render with a heading', async ({ page }) => {
  await page.goto('/en/flower-delivery-rome');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Roma');

  await page.goto('/en/flower-delivery-rome/trastevere');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Trastevere');

  await page.goto('/en/flower-delivery/milano');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Milano');

  await page.goto('/en/journal');
  await expect(page.getByText(/no journal entries/i)).toBeVisible();
});

test('product page emits Product JSON-LD', async ({ page }) => {
  await page.goto('/en/product/rosa-classica');
  const ld = page.locator('script[type="application/ld+json"]');
  await expect(ld.first()).toBeAttached();
  const payloads = await ld.allTextContents();
  expect(payloads.some((p) => p.includes('"AggregateOffer"'))).toBeTruthy();
});
