import { test } from 'e2e/configs/playwright.fixtures';
import path from 'path';
import { RESULTS_DIR, TEST_PASSWORD, TEST_USER } from '../../../playwright.config';

test.describe('Authentication setup', () => {
  test('should create session tokens', async ({
    browserName,
    context,
    errorBoundary,
    forbiddenPage,
    loginPage,
    notFoundPage,
    submitPage
  }) => {
    const storageFile = `session-${browserName}.json`;

    void errorBoundary.expectNoErrors();
    void forbiddenPage.expectNoErrors();
    void notFoundPage.expectNoErrors();

    // void errorBoundary.waitForFallback().then(({ stack }) => {
    //   expect(stack, `Unexpected ErrorBoundary appeared!`).toBeFalsy();
    // });

    // void forbiddenPage.waitForFallback().then(({ visible }) => {
    //   expect(visible, `Unexpected Forbidden page appeared`).toBeFalsy();
    // });

    await submitPage.goto();
    await loginPage.waitFor({ state: 'visible' });
    await loginPage.login(TEST_USER, TEST_PASSWORD);
    await submitPage.waitFor({ state: 'visible' });

    await test.step('Persist authenticated session state', async () => {
      await context.storageState({ path: path.join(RESULTS_DIR, storageFile) });
    });
  });
});
