import { test as base } from '@playwright/test';
import { ErrorBoundary } from 'e2e/components/error_boundary.pom';
import { CrashPage } from 'e2e/pages/crash.pom';
import { Logger } from 'e2e/utils/playwright.logger';
import { tryCatchRace } from 'e2e/utils/playwright.utils';

type Fixtures = {
  logger: Logger;
  errorBoundary: ErrorBoundary;
  crashPage: CrashPage;
};

export const test = base.extend<Fixtures>({
  logger: Logger.fixture(),
  errorBoundary: ErrorBoundary.fixture(),
  crashPage: CrashPage.fixture()
});

test.describe('Crash Page', () => {
  test('should trigger the ErrorBoundary when crashing', async ({ crashPage, errorBoundary, logger, page }) => {
    const triggerCrashFlow = async () => {
      await crashPage.goto();
      await crashPage.waitFor();
      await page.waitForTimeout(5_000);
    };

    const { error } = await tryCatchRace([triggerCrashFlow(), errorBoundary.waitFor()]);

    if (errorBoundary.isError(error)) {
      const message = await errorBoundary.getErrorStack();
      logger.success(`ErrorBoundary triggered as expected`);
      logger.log(message);
    } else {
      throw new Error('ErrorBoundary did not trigger when expected');
    }
  });
});
