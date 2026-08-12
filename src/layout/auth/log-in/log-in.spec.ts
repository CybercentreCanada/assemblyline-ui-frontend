import type { Page } from '@playwright/test';
import { LONG_TIMEOUT, SHORT_TIMEOUT, TEST_USER_PASSWORD, TEST_USER_USERNAME } from 'app/spec.constant';
import { test } from 'core/e2e/e2e.fixtures';

test.describe('Login and Logout page', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: undefined
      // recordVideo: { dir: `${RESULTS_DIR}/videos`, size: { width: 1280, height: 720 } }
    });
    page = await context.newPage();
  });

  test('should login and logout the user', async () => {
    await test.step(`Navigating to "/" and waiting for the login page to be visible`, async () => {
      await page.goto('/');
      await page.getByLabel('Username').waitFor({ state: 'visible', timeout: LONG_TIMEOUT });
    });

    await test.step(`Filling in a user's credentials`, async () => {
      await page.getByLabel('Username').fill(TEST_USER_USERNAME);
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
    });

    await test.step('Clicking the sign in button', async () => {
      await page.getByRole('button', { name: 'Sign in' }).click({ timeout: SHORT_TIMEOUT });
    });

    await test.step('Waiting for the Submit page to become visible', async () => {
      await page.locator('#file_dropper').waitFor({ state: 'visible', timeout: LONG_TIMEOUT });
    });

    await test.step('Opening the User Menu', async () => {
      await page.getByRole('button', { name: 'user-menu' }).click({ timeout: SHORT_TIMEOUT });
    });

    await test.step('Clicking the Logout button', async () => {
      await page.getByRole('button', { name: 'logout' }).click({ timeout: SHORT_TIMEOUT });
    });

    await test.step('Expecting the page route to become "/logout"', async () => {
      await page.getByText('Logging out current user ...').waitFor({ state: 'visible', timeout: SHORT_TIMEOUT });
    });

    await test.step('Expecting the page route to return to the login page', async () => {
      await page.getByLabel('Username').waitFor({ state: 'visible', timeout: LONG_TIMEOUT });
    });
  });
});
