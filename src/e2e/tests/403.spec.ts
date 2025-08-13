import { test as base } from '@playwright/test';
import { ErrorBoundary } from 'e2e/components/error_boundary.pom';
import { ForbiddenPage } from 'e2e/pages/403.pom';
import { CrashPage } from 'e2e/pages/crash.pom';
import { Logger } from 'e2e/utils/playwright.logger';
import { tryCatchRace } from 'e2e/utils/playwright.utils';

type Fixtures = {
  logger: Logger;
  errorBoundary: ErrorBoundary;
  crashPage: CrashPage;
  forbiddenPage: ForbiddenPage;
};

export const test = base.extend<Fixtures>({
  logger: Logger.fixture(),
  errorBoundary: ErrorBoundary.fixture(),
  crashPage: CrashPage.fixture(),
  forbiddenPage: ForbiddenPage.fixture()
});

test.describe('Forbidden Page', () => {
  test('should detect the forbidden page', async ({ forbiddenPage, errorBoundary, logger, page }) => {
    const navigateToForbidden = async () => {
      await page.goto('/forbidden');
      await page.waitForTimeout(5_000);
    };

    const { error } = await tryCatchRace([navigateToForbidden(), errorBoundary.waitFor(), forbiddenPage.waitFor()]);

    await errorBoundary.handleIfError(error);

    if (forbiddenPage.isError(error)) {
      logger.success(`Forbidden page detected`);
      return;
    }

    throw new Error('Neither ForbiddenPage nor ErrorBoundary triggered when expected');
  });
});
