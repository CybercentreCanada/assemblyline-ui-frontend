import { LONG_TIMEOUT, MOCKS_DIR } from 'e2e/shared/constants';
import { test } from 'e2e/shared/fixtures';
import path from 'path';

test.describe('Submit Page', () => {
  test('should submit a file successfully', async ({ userSession }) => {
    void userSession.crashPage.monitorForNoError();
    void userSession.notFoundPage.monitorForNoError();
    void userSession.forbiddenPage.monitorForNoError();
    void userSession.snackbarContext.monitorForNoError();

    await userSession.submitPage.goto();
    await userSession.submitPage.expectToBeVisible();
    await userSession.submitPage.switchTab('File');

    const testFilePath = path.join(MOCKS_DIR, 'samples', 'test.txt');
    await userSession.submitPage.uploadFile(testFilePath);
    await userSession.submitPage.selectSubmissionProfile('static');
    await userSession.submitPage.clickSubmit();

    await userSession.snackbarContext.expect('success', /Successfully submitted, redirecting you to submission ID:.*/i);
    await test.step('Waiting for submission detail or report page', async () => {
      await Promise.race([
        userSession.submissionDetailPage.waitForPage({ timeout: LONG_TIMEOUT }),
        userSession.submissionReportPage.waitForPage({ timeout: LONG_TIMEOUT })
      ]);
    });
  });

  test('should submit a hash successfully', async ({ userSession }) => {
    void userSession.crashPage.monitorForNoError();
    void userSession.notFoundPage.monitorForNoError();
    void userSession.forbiddenPage.monitorForNoError();
    void userSession.snackbarContext.monitorForNoError();

    await userSession.submitPage.goto();
    await userSession.submitPage.expectToBeVisible();
    await userSession.submitPage.switchTab('Hash/URL');

    const testFileHash = 'b6668cf8c46c7075e18215d922e7812ca082fa6cc34668d00a6c20aee4551fb6';
    await userSession.submitPage.uploadHash(testFileHash);
    await userSession.submitPage.selectSubmissionProfile('static');
    await userSession.submitPage.clickSubmit();

    await userSession.snackbarContext.expect('success', /Successfully submitted, redirecting you to submission ID:.*/i);
    await test.step('Waiting for submission detail or report page', async () => {
      await Promise.race([
        userSession.submissionDetailPage.waitForPage({ timeout: LONG_TIMEOUT }),
        userSession.submissionReportPage.waitForPage({ timeout: LONG_TIMEOUT })
      ]);
    });
  });
});
