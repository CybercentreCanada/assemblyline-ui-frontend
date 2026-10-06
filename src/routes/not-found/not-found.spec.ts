import { MEDIUM_TIMEOUT } from 'app/spec.constant';
import { test } from 'core/e2e/e2e.fixtures';

test.describe('Not Found page', () => {
  test('should detect the dead link page', async ({ userSession }) => {
    void userSession.crashPage.monitorForNoError();
    void userSession.forbiddenPage.monitorForNoError();
    void userSession.notFoundPage.monitorForError();
    void userSession.snackbarContext.monitorForNoError();

    await userSession.page.goto('/doesnt_exist');
    await userSession.page.waitForTimeout(MEDIUM_TIMEOUT);
  });
});
