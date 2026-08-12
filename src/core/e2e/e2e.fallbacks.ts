import type { Page } from '@playwright/test';
import { CrashPage } from 'core/error/error.pom';
import { TermsOfServicePage } from 'layout/auth/terms-of-service/terms-of-service.pom';
import { ForbiddenPage } from 'routes/forbidden/forbidden.pom';
import { NotFoundPage } from 'routes/not-found/not-found.pom';

export type ErrorDetectionPages = {
  crashPage: CrashPage;
  forbiddenPage: ForbiddenPage;
  notFoundPage: NotFoundPage;
  tosPage: TermsOfServicePage;
};

export function createErrorDetectionPages(page: Page): ErrorDetectionPages {
  return {
    crashPage: new CrashPage(page),
    forbiddenPage: new ForbiddenPage(page),
    notFoundPage: new NotFoundPage(page),
    tosPage: new TermsOfServicePage(page)
  };
}
