import { test } from 'e2e/configs/playwright.fixtures';

test.describe('Not Found page', () => {
  test('should detect the dead link page', async ({ user }) => {
    void user.crashPage.expectNoErrors();
    void user.forbiddenPage.expectNoErrors();

    void user.notFoundPage.expectErrors();

    await user.page.goto('/doesnt_exist');
    await user.page.waitForTimeout(2_000);
  });
});
