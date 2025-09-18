import { test } from 'e2e/utils/playwright.fixtures';
import { tryCatchRace } from 'e2e/utils/playwright.utils';

test.describe('Forbidden Page', () => {
  test('should detect the forbidden page', async ({ forbiddenPage, errorBoundary, page }) => {
    const navigateToForbidden = async () => {
      await forbiddenPage.goto();
      await page.waitForTimeout(5_000);
    };

    const { error } = await tryCatchRace([navigateToForbidden(), errorBoundary.waitFor(), forbiddenPage.waitFor()]);

    if (errorBoundary.isError(error)) await errorBoundary.expectNotVisible();
    if (forbiddenPage.isError(error)) await forbiddenPage.expectVisible();
  });
});
