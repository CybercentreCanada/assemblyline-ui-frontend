import { test } from 'core/e2e/e2e.fixtures';

test.describe('Forbidden page', () => {
  test('should detect the forbidden page', async ({ userSession }) => {
    void userSession.crashPage.monitorForNoError();
    void userSession.notFoundPage.monitorForNoError();
    void userSession.forbiddenPage.monitorForError();
    void userSession.snackbarContext.monitorForNoError();

    await userSession.forbiddenPage.goto();
    await userSession.forbiddenPage.expectToBeVisible();
  });
});
