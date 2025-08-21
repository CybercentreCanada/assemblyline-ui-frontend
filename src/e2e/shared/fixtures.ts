/* eslint-disable react-hooks/rules-of-hooks */
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { test as base } from '@playwright/test';
import { ForbiddenPage } from 'e2e/pages/403.pom';
import { NotFoundPage } from 'e2e/pages/404_dl.pom';
import { CrashPage } from 'e2e/pages/crash.pom';
import { LoginPage } from 'e2e/pages/login.pom';
import { SubmitPage } from 'e2e/pages/submit.pom';
import { TermsOfServicePage } from 'e2e/pages/tos.pom';
import { RESULTS_DIR } from 'e2e/shared/constants';
import type { PlaywrightArgs } from 'e2e/shared/models';
import path from 'path';

type UserInterface = {
  // Fixtures
  context: BrowserContext;
  page: Page;

  // Error detection
  crashPage: CrashPage;
  forbiddenPage: ForbiddenPage;
  notFoundPage: NotFoundPage;
  tosPage: TermsOfServicePage;

  // Pages
  loginPage: LoginPage;
  submitPage: SubmitPage;
};

type SetupBundle = {
  browser: Browser;
  browserName: string;
  user: 'admin' | 'user';
};

async function setupBundle({ browser, browserName, user }: SetupBundle): Promise<UserInterface> {
  const context = await browser.newContext({
    storageState: path.join(RESULTS_DIR, `${browserName}-${user}-session.json`)
  });
  const page = await context.newPage();

  return {
    context,
    page,
    crashPage: new CrashPage(page),
    forbiddenPage: new ForbiddenPage(page),
    notFoundPage: new NotFoundPage(page),
    loginPage: new LoginPage(page),
    submitPage: new SubmitPage(page),
    tosPage: new TermsOfServicePage(page)
  };
}

type Fixtures = {
  adminUI: UserInterface;
  userUI: UserInterface;
};

export const test = base.extend<Fixtures>({
  adminUI: async ({ browser, browserName }: PlaywrightArgs, use: (r: UserInterface) => Promise<void>) => {
    const bundle = await setupBundle({ browser, browserName, user: 'admin' });
    await use(bundle);
    await bundle.context.close();
  },

  userUI: async ({ browser, browserName }: PlaywrightArgs, use: (r: UserInterface) => Promise<void>) => {
    const bundle = await setupBundle({ browser, browserName, user: 'user' });
    await use(bundle);
    await bundle.context.close();
  }
});

export { expect } from '@playwright/test';
