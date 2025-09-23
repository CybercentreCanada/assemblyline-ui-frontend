import { test } from 'e2e/shared/fixtures';

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
