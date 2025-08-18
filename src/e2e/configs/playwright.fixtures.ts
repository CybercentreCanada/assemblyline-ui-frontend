import { test as base } from '@playwright/test';
import { ErrorBoundary } from 'e2e/components/ErrorBoundary.pom';
import { ForbiddenPage } from 'e2e/pages/403.pom';
import { NotFoundPage } from 'e2e/pages/404_dl.pom';
import { CrashPage } from 'e2e/pages/crash.pom';
import { LoginPage } from 'e2e/pages/login.pom';
import { SubmitPage } from 'e2e/pages/submit.pom';

type Fixtures = {
  // Utilities
  // api: API;
  // logger: Logger;

  // Error detection
  errorBoundary: ErrorBoundary;
  forbiddenPage: ForbiddenPage;
  notFoundPage: NotFoundPage;

  // Pages
  crashPage: CrashPage;
  loginPage: LoginPage;
  submitPage: SubmitPage;
};

export const test = base.extend<Fixtures>({
  // Utilities
  // api: API.fixture(),
  // logger: Logger.fixture(),

  // Error detection
  errorBoundary: ErrorBoundary.fixture(),
  forbiddenPage: ForbiddenPage.fixture(),
  notFoundPage: NotFoundPage.fixture(),

  // Pages
  crashPage: CrashPage.fixture(),
  loginPage: LoginPage.fixture(),
  submitPage: SubmitPage.fixture()
});

export { expect } from '@playwright/test';
