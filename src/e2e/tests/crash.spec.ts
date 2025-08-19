import { expect, test } from 'e2e/configs/playwright.fixtures';

test.describe('Crash page', () => {
  test('should trigger the ErrorBoundary when crashing', async ({ user }) => {
    void user.forbiddenPage.expectNoErrors();
    void user.notFoundPage.expectNoErrors();

    void user.crashPage.waitForFallback().then(({ message }) => {
      expect(message).toBe('This is a test crash !');
    });

    await user.crashPage.goto();
    await user.crashPage.waitFor();
  });
});
