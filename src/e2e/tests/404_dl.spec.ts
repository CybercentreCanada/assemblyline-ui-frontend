import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { test } from 'e2e/shared/fixtures';

test.describe('Not Found page', () => {
  test('should detect the dead link page', async ({ userSession }) => {
    void userSession.crashPage.monitorForNoError();
    void userSession.forbiddenPage.monitorForNoError();
    void userSession.notFoundPage.monitorForError();

    await userSession.page.goto('/doesnt_exist');
    await userSession.page.waitForTimeout(MEDIUM_TIMEOUT);
  });
});
