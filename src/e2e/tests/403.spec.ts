import { test } from 'e2e/configs/playwright.fixtures';

test.describe('Forbidden page', () => {
  test('should detect the forbidden page', async ({ userUI }) => {
    void userUI.crashPage.monitorForNoError();
    void userUI.notFoundPage.monitorForNoError();
    void userUI.forbiddenPage.monitorForError();

    await userUI.forbiddenPage.goto();
    await userUI.page.waitForTimeout(2_000);
  });
});
