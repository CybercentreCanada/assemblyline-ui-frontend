import { expect, test } from 'e2e/shared/fixtures';

test.describe('Crash page', () => {
  test('should trigger the ErrorBoundary when crashing', async ({ userSession }) => {
    void userSession.forbiddenPage.monitorForNoError();
    void userSession.notFoundPage.monitorForNoError();
    void userSession.snackbarContext.monitorForNoError();

    void userSession.crashPage.waitForFallback().then(({ message }) => {
      expect(message).toBe('This is a test crash !');
    });

    await userSession.crashPage.goto();
    await userSession.crashPage.expectToBeVisible();
  });
});
