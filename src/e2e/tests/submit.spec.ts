import { expect } from '@playwright/test';
import { MOCK_ADMIN_WHOAMI } from 'e2e/mocks/users/admin';
import { test } from 'e2e/utils/playwright.fixtures';
import { tryCatchRace } from 'e2e/utils/playwright.utils';

test.describe('Submit Page', () => {
  test('should load successfully', async ({ forbiddenPage, errorBoundary, notFoundPage, submitPage }) => {
    const navigateToSubmitPage = async () => {
      await submitPage.goto();
      await submitPage.waitFor({ timeout: 10_000 });
      expect(await submitPage.isVisible()).toBe(true);
    };

    const { error } = await tryCatchRace([
      navigateToSubmitPage(),
      errorBoundary.waitFor(), // rejects if ErrorBoundary shows
      forbiddenPage.waitFor(), // rejects if 403 page shows
      notFoundPage.waitFor() // rejects if 404 page shows
    ]);

    if (errorBoundary.isError?.(error)) await errorBoundary.expectNotVisible?.();
    if (forbiddenPage.isError?.(error)) await forbiddenPage.expectNotVisible?.();
    if (notFoundPage.isError?.(error)) await notFoundPage.expectNotVisible?.();
  });

  test.skip('should load as admin', async ({ forbiddenPage, errorBoundary, notFoundPage, submitPage, api }) => {
    const admin = structuredClone(MOCK_ADMIN_WHOAMI);
    admin.configuration.ui.banner = { en: 'This is a test for the banner', fr: null };
    admin.configuration.ui.banner_level = 'warning';

    await api.get('/api/v4/user/whoami/', admin);

    const navigateToSubmitPage = async () => {
      await submitPage.goto();
      await submitPage.waitFor({ timeout: 10_000 });
      expect(await submitPage.isVisible()).toBe(true);

      console.log(await submitPage.getBanner());

      // Poll until the banner renders with the expected content/level
      await expect
        .poll(async () => submitPage.getBanner(), { timeout: 5000, message: 'Waiting for banner to match' })
        .toEqual({ level: 'warning', textContent: 'This is a test for the banner' });
    };

    const { error } = await tryCatchRace([
      navigateToSubmitPage(),
      errorBoundary.waitFor(),
      forbiddenPage.waitFor(),
      notFoundPage.waitFor()
    ]);

    if (errorBoundary.isError?.(error)) await errorBoundary.expectNotVisible?.();
    if (forbiddenPage.isError?.(error)) await forbiddenPage.expectNotVisible?.();
    if (notFoundPage.isError?.(error)) await notFoundPage.expectNotVisible?.();
  });
});
