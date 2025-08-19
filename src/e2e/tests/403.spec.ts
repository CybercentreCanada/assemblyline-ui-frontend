import { test } from 'e2e/configs/playwright.fixtures';

test.describe('Forbidden page', () => {
  test('should detect the forbidden page', async ({ user }) => {
    void user.crashPage.expectNoErrors();
    void user.notFoundPage.expectNoErrors();

    void user.forbiddenPage.expectErrors();

    await user.forbiddenPage.goto();
    await user.page.waitForTimeout(2_000);
  });
});
