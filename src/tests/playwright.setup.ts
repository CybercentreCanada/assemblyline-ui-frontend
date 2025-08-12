import { test } from '@playwright/test';
import path from 'path';
import { ErrorFallback } from 'tests/pages/error_fallback.pom';
import { logStep } from 'tests/playwright.utils';
import { BASE_URL, BROWSERS, RESULTS_DIR, TEST_PASSWORD, TEST_USER } from '../../playwright.config';

test.describe('Setup', () => {
  test('Create session tokens', async ({ browserName, browser, context, page }, testInfo) => {
    const browserConfig = BROWSERS.find(b => b.name === browserName);
    if (!browserConfig) {
      throw new Error(`No browser config found for browserName: ${browserName}`);
    }

    const { label, color } = browserConfig;
    const storageFile = `session-${browserConfig.name}.json`;

    try {
      const errorFallback = new ErrorFallback(page, testInfo);

      await errorFallback.runWithCheck(async () => {
        logStep(label, color, 'Navigating to login page...');
        await page.goto(BASE_URL);

        logStep(label, color, 'Filling in login credentials...');
        await page.getByLabel('Username').fill(TEST_USER);
        await page.getByLabel('Password').fill(TEST_PASSWORD);

        logStep(label, color, 'Clicking sign in button...');
        await page.getByRole('button', { name: 'Sign in' }).click();

        logStep(label, color, 'Waiting for authenticated element...');
        await page.locator('img[src="/images/banner_dark.svg"]').waitFor();

        logStep(label, color, `Saving storage state to ${storageFile}...`);
        await context.storageState({ path: path.join(RESULTS_DIR, storageFile) });
      });
    } catch (error) {
      logStep(label, color, `Error during authentication - ${error}`, 'failure');
      throw error;
    } finally {
      logStep(label, color, 'Closing browser...');
      await browser.close();
    }
  });
});
