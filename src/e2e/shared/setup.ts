import type { Browser, BrowserContext } from '@playwright/test';
import { ForbiddenPage } from 'e2e/pages/403.pom';
import { NotFoundPage } from 'e2e/pages/404_dl.pom';
import { CrashPage } from 'e2e/pages/crash.pom';
import { LoginPage } from 'e2e/pages/login.pom';
import { SubmitPage } from 'e2e/pages/submit.pom';
import { ADMIN_PASSWORD, ADMIN_USER, RESULTS_DIR, TEST_PASSWORD, TEST_USER } from 'e2e/shared/constants';
import { test } from 'e2e/shared/fixtures';
import fs from 'fs';
import path from 'path';

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

    const crashPage = new CrashPage(page);
    const forbiddenPage = new ForbiddenPage(page);
    const notFoundPage = new NotFoundPage(page);

    void crashPage.monitorForNoError();
    void forbiddenPage.monitorForNoError();
    void notFoundPage.monitorForNoError();

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
