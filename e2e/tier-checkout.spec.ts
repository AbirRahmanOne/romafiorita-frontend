import { expect, test } from '@playwright/test';

// Addendum: "tier selection → checkout total matches the backend quote."
test('selecting a tier updates the price and carries it into the cart', async ({ page }) => {
  await page.goto('/en/product/rosa-classica');

  // Default is Premium (€49.00). Switching to Luxury must change the Add button price.
  const addButton = page.getByRole('button', { name: /add to basket/i });
  await expect(addButton).toContainText('49');

  await page.getByRole('radio', { name: /Luxury/ }).click();
  await expect(addButton).toContainText('68'); // round(4900 * 1.4) = 6860 → €68.60

  await addButton.click();
  await page.waitForURL(/\/cart$/);

  // The cart reflects the chosen tier and its server-quoted line price.
  await expect(page.getByText('Luxury')).toBeVisible();
  await expect(page.getByText('Rosa Classica')).toBeVisible();
  await expect(page.getByText(/68/)).toBeVisible();
});
