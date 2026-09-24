import { test } from 'core/e2e/e2e.fixtures';

test.describe('Terms of Service page', () => {
  test('should detect the Terms of Service page', async ({ userSession }) => {
    void userSession.crashPage.monitorForNoError();
    void userSession.notFoundPage.monitorForNoError();
    void userSession.forbiddenPage.monitorForNoError();
    void userSession.tosPage.monitorForError();
    void userSession.snackbarContext.monitorForNoError();

    await userSession.tosPage.goto();
    await userSession.tosPage.expectToBeVisible();
  });
});
