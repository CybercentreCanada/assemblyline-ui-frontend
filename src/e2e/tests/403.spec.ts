import { test } from 'e2e/configs/playwright.fixtures';

test.describe('Forbidden page', () => {
  test('should detect the forbidden page', async ({ forbiddenPage, errorBoundary, page, notFoundPage }) => {
    void errorBoundary.expectNoErrors();
    void notFoundPage.expectNoErrors();

    void forbiddenPage.expectErrors();

    await forbiddenPage.goto();
    await page.waitForTimeout(2_000);
  });
});
