import { expect, test } from 'e2e/shared/fixtures';

test.describe('Crash page', () => {
  test('should trigger the ErrorBoundary when crashing', async ({ userUI }) => {
    void userUI.forbiddenPage.monitorForNoError();
    void userUI.notFoundPage.monitorForNoError();

    void userUI.crashPage.waitForFallback().then(({ message }) => {
      expect(message).toBe('This is a test crash !');
    });

    await userUI.crashPage.goto();
    await userUI.crashPage.waitFor();
  });
});
