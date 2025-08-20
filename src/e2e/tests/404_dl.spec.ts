import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { test } from 'e2e/shared/fixtures';

test.describe('Not Found page', () => {
  test('should detect the dead link page', async ({ userUI }) => {
    void userUI.crashPage.monitorForNoError();
    void userUI.forbiddenPage.monitorForNoError();
    void userUI.notFoundPage.monitorForError();

    await userUI.page.goto('/doesnt_exist');
    await userUI.page.waitForTimeout(MEDIUM_TIMEOUT);
  });
});
