import { expect } from '@playwright/test';
import { test } from 'e2e/utils/playwright.fixtures';
import { tryCatchRace } from 'e2e/utils/playwright.utils';

test.describe('Submit Page', () => {
  test('should load successfully', async ({ forbiddenPage, errorBoundary, notFoundPage, submitPage }) => {
    const navigateToSubmitPage = async () => {
      await submitPage.goto();
      await submitPage.waitFor({ timeout: 10_000 });
      const isVisible = await submitPage.isVisible();
      expect(isVisible).toBe(true);
    };

    const { error } = await tryCatchRace([
      navigateToSubmitPage(),
      errorBoundary.waitFor(),
      forbiddenPage.waitFor(),
      notFoundPage.waitFor()
    ]);

    if (errorBoundary.isError(error)) await errorBoundary.expectNotVisible();
    if (forbiddenPage.isError(error)) await forbiddenPage.expectNotVisible();
    if (notFoundPage.isError(error)) await notFoundPage.expectNotVisible();
  });
});
