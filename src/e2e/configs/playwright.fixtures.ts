/* eslint-disable react-hooks/rules-of-hooks */
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { test as base } from '@playwright/test';
import type { PlaywrightArgs } from 'e2e/configs/playwright.models';
import { ForbiddenPage } from 'e2e/pages/403.pom';
import { NotFoundPage } from 'e2e/pages/404_dl.pom';
import { CrashPage } from 'e2e/pages/crash.pom';
import { LoginPage } from 'e2e/pages/login.pom';
import { SubmitPage } from 'e2e/pages/submit.pom';
import path from 'path';
import { RESULTS_DIR } from '../../../playwright.config';

type UserPage = {
  context: BrowserContext;
  page: Page;

  // Error detection
  crashPage: CrashPage;
  forbiddenPage: ForbiddenPage;
  notFoundPage: NotFoundPage;

  // Pages
  loginPage: LoginPage;
  submitPage: SubmitPage;
};

type SetupBundle = {
  browser: Browser;
  browserName: string;
  user: 'admin' | 'user';
};

type POMBundle = {
  // Fixtures
  context: BrowserContext;
  page: Page;

  // Error detection
  crashPage: CrashPage;
  forbiddenPage: ForbiddenPage;
  notFoundPage: NotFoundPage;

  // Pages
  loginPage: LoginPage;
  submitPage: SubmitPage;
};

async function setupBundle({ browser, browserName, user }: SetupBundle): Promise<POMBundle> {
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
    submitPage: new SubmitPage(page)
  };
}

type Fixtures = {
  // Utilities
  // api: API;
  // logger: Logger;

  // // Error detection
  // crashPage: CrashPage;
  // forbiddenPage: ForbiddenPage;
  // notFoundPage: NotFoundPage;

  // // Pages
  // loginPage: LoginPage;
  // submitPage: SubmitPage;

  // Users
  admin: POMBundle;
  user: POMBundle;
};

export const test = base.extend<Fixtures>({
  // // Utilities
  // api: API.fixture(),
  // logger: Logger.fixture(),

  // // Error detection
  // crashPage: CrashPage.fixture(),
  // forbiddenPage: ForbiddenPage.fixture(),
  // notFoundPage: NotFoundPage.fixture(),

  // // Pages
  // loginPage: LoginPage.fixture(),
  // submitPage: SubmitPage.fixture(),

  // Users
  admin: async ({ browser, browserName }: PlaywrightArgs, use: (r: POMBundle) => Promise<void>) => {
    const bundle = await setupBundle({ browser, browserName, user: 'admin' });
    await use(bundle);
    await bundle.context.close();
  },

  user: async ({ browser, browserName }: PlaywrightArgs, use: (r: POMBundle) => Promise<void>) => {
    const bundle = await setupBundle({ browser, browserName, user: 'user' });
    await use(bundle);
    await bundle.context.close();
  }

  // admin: async ({ browser }: PlaywrightArgs, use: (r: AuthBundle) => Promise<void>) => {
  //   const context = await browser.newContext();
  //   const page = await context.newPage();

  //   // login as admin
  //   await page.goto('/');
  //   await page.getByLabel('Username').fill('admin');
  //   await page.getByLabel('Password').fill('admin');
  //   await page.getByRole('button', { name: 'Sign in' }).click();
  //   await page.getByText('Welcome').waitFor();

  //   await context.storageState({
  //     path: path.join(RESULTS_DIR, 'admin-session.json')
  //   });

  //   await use({ context, page });
  //   await context.close();
  // },

  // user: async ({ browser }: PlaywrightArgs, use: (r: AuthBundle) => Promise<void>) => {
  //   const context = await browser.newContext();
  //   const page = await context.newPage();

  //   // login as user
  //   await page.goto('/');
  //   await page.getByLabel('Username').fill('user');
  //   await page.getByLabel('Password').fill('user');
  //   await page.getByRole('button', { name: 'Sign in' }).click();
  //   await page.getByText('Welcome').waitFor();

  //   await context.storageState({
  //     path: path.join(RESULTS_DIR, 'user-session.json')
  //   });

  //   await use({ context, page });
  //   await context.close();
  // }
});

export { expect } from '@playwright/test';
