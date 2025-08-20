import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { test } from 'e2e/shared/fixtures';

test.describe('Forbidden page', () => {
  test('should detect the forbidden page', async ({ userUI }) => {
    void userUI.crashPage.monitorForNoError();
    void userUI.notFoundPage.monitorForNoError();
    void userUI.forbiddenPage.monitorForError();

    await userUI.forbiddenPage.goto();
    await userUI.page.waitForTimeout(MEDIUM_TIMEOUT);
  });
});
