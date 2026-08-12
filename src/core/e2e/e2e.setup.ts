import type { Browser, BrowserContext } from '@playwright/test';
import {
  RESULTS_DIR,
  TEST_ADMIN_PASSWORD,
  TEST_ADMIN_USERNAME,
  TEST_USER_PASSWORD,
  TEST_USER_USERNAME
} from 'app/spec.constant';
import { createErrorDetectionPages } from 'core/e2e/e2e.fallbacks';
import { test } from 'core/e2e/e2e.fixtures';
import fs from 'fs';
import { LoginPage } from 'layout/auth/log-in/log-in.pom';
import path from 'path';
import { SubmitPage } from 'routes/submit/submit.pom';

type LoginAndSaveProps = {
  browser: Browser;
  username: string;
  password: string;
  storageFile: string;
};

test.describe('Authentication setup', () => {
  async function loginAndSave({ browser, username, password, storageFile }: LoginAndSaveProps) {
    const storagePath = path.join(RESULTS_DIR, storageFile);

    let context: BrowserContext;
    if (fs.existsSync(storagePath)) context = await browser.newContext({ storageState: storagePath });
    else context = await browser.newContext();
    const page = await context.newPage();

    const submitPage = new SubmitPage(page);
    const loginPage = new LoginPage(page);

    const { crashPage, forbiddenPage, notFoundPage, tosPage } = createErrorDetectionPages(page);

    void crashPage.monitorForNoError();
    void forbiddenPage.monitorForNoError();
    void notFoundPage.monitorForNoError();
    void tosPage.acceptIfVisible();

    await test.step(`Check if ${username} is already authenticated`, async () => {
      await submitPage.goto();

      if (await loginPage.isVisible()) {
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
      username: TEST_USER_USERNAME,
      password: TEST_USER_PASSWORD,
      storageFile: `${browserName}-user-session.json`
    });
  });

  test('create admin session', async ({ browser, browserName }) => {
    await loginAndSave({
      browser,
      username: TEST_ADMIN_USERNAME,
      password: TEST_ADMIN_PASSWORD,
      storageFile: `${browserName}-admin-session.json`
    });
  });
});
