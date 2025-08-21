import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { test } from 'e2e/shared/fixtures';

test.describe('Terms of Service page', () => {
  test('should detect the Terms of Service page', async ({ userUI }) => {
    void userUI.crashPage.monitorForNoError();
    void userUI.notFoundPage.monitorForNoError();
    void userUI.forbiddenPage.monitorForNoError();
    void userUI.tosPage.monitorForError();

    await userUI.tosPage.goto();
    await userUI.page.waitForTimeout(MEDIUM_TIMEOUT);
  });
});
