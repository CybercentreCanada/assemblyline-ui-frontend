import { test } from '@playwright/test';
import { testWithErrorFallback } from 'e2e/components/error_boundary/error_fallback.pom';
import { Logger } from 'e2e/utils/playwright.logger';
import path from 'path';
import { BASE_URL, BROWSERS, RESULTS_DIR, TEST_PASSWORD, TEST_USER } from '../../../playwright.config';

test.describe('Setup', () => {
  testWithErrorFallback('Create session tokens', async ({ browserName, context, page }, testInfo) => {
    const browserConfig = BROWSERS.find(b => b.name === browserName);
    const logger = new Logger(browserConfig, testInfo.titlePath);
    const storageFile = `session-${browserConfig.name}.json`;

    logger.info('Navigating to login page...');
    await page.goto(BASE_URL);

    logger.info('Filling in login credentials...');
    await page.getByLabel('Username').fill(TEST_USER);
    await page.getByLabel('Password').fill(TEST_PASSWORD);

    logger.info('Clicking sign in button...');
    await page.getByRole('button', { name: 'Sign in' }).click();

    logger.info('Waiting for authenticated element...');
    await page.locator('img[src="/images/banner_dark.svg"]').waitFor();

    logger.info(`Saving storage state to ${storageFile}...`);
    await context.storageState({ path: path.join(RESULTS_DIR, storageFile) });
  });
});
