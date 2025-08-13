import { test } from 'e2e/utils/playwright.fixtures';
import { tryCatchRace } from 'e2e/utils/playwright.utils';
import path from 'path';
import { RESULTS_DIR, TEST_PASSWORD, TEST_USER } from '../../../playwright.config';

test.describe('Setup', () => {
  test('should create session tokens', async ({
    browserName,
    context,
    logger,
    errorBoundary,
    loginPage,
    submitPage,
    forbiddenPage,
    notFoundPage
  }) => {
    const storageFile = `session-${browserName}.json`;

    const loginAndSaveSession = async () => {
      await submitPage.goto();
      await loginPage.waitFor();
      await loginPage.login(TEST_USER, TEST_PASSWORD);
      await submitPage.waitFor();

      logger.info(`Saving storage state to ${storageFile}`);
      await context.storageState({ path: path.join(RESULTS_DIR, storageFile) });
    };

    const { error } = await tryCatchRace([
      loginAndSaveSession(),
      errorBoundary.waitFor(),
      forbiddenPage.waitFor(),
      notFoundPage.waitFor()
    ]);

    if (errorBoundary.isError(error)) await errorBoundary.expectNotVisible();
    if (forbiddenPage.isError(error)) await forbiddenPage.expectNotVisible();
    if (notFoundPage.isError(error)) await notFoundPage.expectNotVisible();
  });
});
