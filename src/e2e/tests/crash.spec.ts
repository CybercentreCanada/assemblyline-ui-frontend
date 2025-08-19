import { expect, test } from 'e2e/configs/playwright.fixtures';

test.describe('Crash page', () => {
  test('should trigger the ErrorBoundary when crashing', async ({
    crashPage,
    errorBoundary,
    forbiddenPage,
    notFoundPage
  }) => {
    void forbiddenPage.expectNoErrors();
    void notFoundPage.expectNoErrors();

    void errorBoundary.waitForFallback().then(({ message }) => {
      expect(message).toBe('This is a test crash !');
    });

    await crashPage.goto();
    await crashPage.waitFor();
  });
});
