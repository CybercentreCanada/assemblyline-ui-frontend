import { test } from 'e2e/configs/playwright.fixtures';

test.describe('Not Found page', () => {
  test('should detect the dead link page', async ({ notFoundPage, errorBoundary, page, forbiddenPage }) => {
    void errorBoundary.expectNoErrors();
    void forbiddenPage.expectNoErrors();

    void notFoundPage.expectErrors();

    await page.goto('/doesnt_exist');
    await page.waitForTimeout(2_000);
  });
});
