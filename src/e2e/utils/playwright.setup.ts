import { test as base } from '@playwright/test';
import { ErrorBoundary } from 'e2e/components/error_boundary.pom';
import { LoginPage } from 'e2e/routes/login.pom';
import { SubmitPage } from 'e2e/routes/submit.pom';
import { Logger } from 'e2e/utils/playwright.logger';
import { tryCatchRace } from 'e2e/utils/playwright.utils';
import path from 'path';
import { RESULTS_DIR, TEST_PASSWORD, TEST_USER } from '../../../playwright.config';

type Fixtures = {
  logger: Logger;
  errorBoundary: ErrorBoundary;
  loginPage: LoginPage;
  submitPage: SubmitPage;
};

export const test = base.extend<Fixtures>({
  logger: Logger.fixture(),
  errorBoundary: ErrorBoundary.fixture(),
  loginPage: LoginPage.fixture(),
  submitPage: SubmitPage.fixture()
});

test.describe('Setup', () => {
  test('Create session tokens', async ({ browserName, context, logger, errorBoundary, loginPage, submitPage }) => {
    const storageFile = `session-${browserName}.json`;

    const promise = async () => {
      await submitPage.goto();
      await loginPage.waitFor();
      await loginPage.login(TEST_USER, TEST_PASSWORD);
      await submitPage.waitFor();

      logger.info(`Saving storage state to ${storageFile}`);
      await context.storageState({ path: path.join(RESULTS_DIR, storageFile) });
    };

    const { error } = await tryCatchRace([promise(), errorBoundary.failIfVisible()]);

    if (errorBoundary.isError(error)) {
      const message = await errorBoundary.getErrorStack();
      logger.error(message);
      throw new Error(error.message);
    }
  });
});
