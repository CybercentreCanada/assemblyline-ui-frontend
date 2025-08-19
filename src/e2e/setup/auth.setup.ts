import type { Browser, BrowserContext } from '@playwright/test';
import { ErrorBoundary } from 'e2e/components/ErrorBoundary.pom';
import { test } from 'e2e/configs/playwright.fixtures';
import { ForbiddenPage } from 'e2e/pages/403.pom';
import { NotFoundPage } from 'e2e/pages/404_dl.pom';
import { LoginPage } from 'e2e/pages/login.pom';
import { SubmitPage } from 'e2e/pages/submit.pom';
import fs from 'fs';
import path from 'path';
import { ADMIN_PASSWORD, ADMIN_USER, RESULTS_DIR, TEST_PASSWORD, TEST_USER } from '../../../playwright.config';

type LoginAndSaveProps = {
  browser: Browser;
  username: string;
  password: string;
  storageFile: string;
};

test.describe('Authentication setup', () => {
  // async function loginAndSave({
  //   context,
  //   username,
  //   password,
  //   storageFile,
  //   errorBoundary,
  //   forbiddenPage,
  //   loginPage,
  //   notFoundPage,
  //   submitPage
  // }: LoginAndSaveProps) {
  //   void errorBoundary.expectNoErrors();
  //   void forbiddenPage.expectNoErrors();
  //   void notFoundPage.expectNoErrors();

  //   await submitPage.goto();
  //   await loginPage.waitFor({ state: 'visible' });
  //   await loginPage.login(username, password);
  //   await submitPage.waitFor({ state: 'visible' });

  //   await test.step(`Persist authenticated session for ${username}`, async () => {
  //     await context.storageState({ path: path.join(RESULTS_DIR, storageFile) });
  //   });
  // }

  async function loginAndSave({ browser, username, password, storageFile }: LoginAndSaveProps) {
    const storagePath = path.join(RESULTS_DIR, storageFile);

    let context: BrowserContext;
    if (fs.existsSync(storagePath)) context = await browser.newContext({ storageState: storagePath });
    else context = await browser.newContext();
    const page = await context.newPage();

    const submitPage = new SubmitPage(page);
    const loginPage = new LoginPage(page);

    const errorBoundary = new ErrorBoundary(page);
    const forbiddenPage = new ForbiddenPage(page);
    const notFoundPage = new NotFoundPage(page);

    void errorBoundary.expectNoErrors();
    void forbiddenPage.expectNoErrors();
    void notFoundPage.expectNoErrors();

    await test.step(`Check if ${username} is already authenticated`, async () => {
      await submitPage.goto();

      if (await loginPage.isVisible({ timeout: 3_000 })) {
        // Not logged in → perform login
        await loginPage.login(username, password);
        await submitPage.waitFor({ state: 'visible' });

        // Save new state
        await test.step(`Persist authenticated session for ${username}`, async () => {
          await context.storageState({ path: storagePath });
        });
      } else {
        // Already authenticated, nothing else to do
        await submitPage.waitFor({ state: 'visible' });
      }
    });

    return { context, page };
  }

  test('create user session', async ({ browser, browserName }) => {
    await loginAndSave({
      browser,
      username: TEST_USER,
      password: TEST_PASSWORD,
      storageFile: `${browserName}-user-session.json`
    });
  });

  test('create admin session', async ({ browser, browserName }) => {
    await loginAndSave({
      browser,
      username: ADMIN_USER,
      password: ADMIN_PASSWORD,
      storageFile: `${browserName}-admin-session.json`
    });
  });
});
