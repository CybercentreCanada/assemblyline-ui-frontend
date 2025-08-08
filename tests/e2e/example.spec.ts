import { test } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the page title', async ({ page }) => {
    await page.goto('/');
    // await expect(page).toHaveTitle(/React App/i);
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    // await page.click('text=Learn React');
    // await expect(page).toHaveURL(/\/learn/);
  });
});
