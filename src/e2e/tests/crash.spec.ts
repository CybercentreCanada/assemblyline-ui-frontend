import { expect } from '@playwright/test';
import { test } from 'e2e/utils/playwright.fixtures';
import { tryCatchRace } from 'e2e/utils/playwright.utils';

test.describe('Crash Page', () => {
  test('should trigger the ErrorBoundary when crashing', async ({ crashPage, errorBoundary, page }) => {
    const triggerCrashFlow = async () => {
      await crashPage.goto();
      await crashPage.waitFor();
      await page.waitForTimeout(5_000);
    };

    const { error } = await tryCatchRace([triggerCrashFlow(), errorBoundary.waitFor()]);

    if (errorBoundary.isError(error)) await errorBoundary.expectVisible();
    else expect(false, 'Expected the ErrorBoundary to be shown').toBeTruthy();
  });
});
