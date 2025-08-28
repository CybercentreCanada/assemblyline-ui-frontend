import { test as base } from '@playwright/test';
import { ErrorBoundary } from 'e2e/components/error_boundary.pom';
import { NotFoundPage } from 'e2e/pages/404_dl.pom';
import { CrashPage } from 'e2e/pages/crash.pom';
import { Logger } from 'e2e/utils/playwright.logger';
import { tryCatchRace } from 'e2e/utils/playwright.utils';

type Fixtures = {
  logger: Logger;
  errorBoundary: ErrorBoundary;
  crashPage: CrashPage;
  notFoundPage: NotFoundPage;
};

export const test = base.extend<Fixtures>({
  logger: Logger.fixture(),
  errorBoundary: ErrorBoundary.fixture(),
  crashPage: CrashPage.fixture(),
  notFoundPage: NotFoundPage.fixture()
});

test.describe('Not Found Page', () => {
  test('should detect the dead link page', async ({ notFoundPage, errorBoundary, page }) => {
    const navigateToDeadLink = async () => {
      await page.goto('/doesnt_exist');
      await page.waitForTimeout(5_000);
    };

    const { error } = await tryCatchRace([navigateToDeadLink(), errorBoundary.waitFor(), notFoundPage.waitFor()]);

    if (errorBoundary.isError(error)) await errorBoundary.expectNotVisible();
    if (notFoundPage.isError(error)) await notFoundPage.expectVisible();
  });
});
