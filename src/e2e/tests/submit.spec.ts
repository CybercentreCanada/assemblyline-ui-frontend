import { LONG_TIMEOUT, MEDIUM_TIMEOUT, MOCKS_DIR } from 'e2e/shared/constants';
import { test } from 'e2e/shared/fixtures';
import path from 'path';

test.describe('Submit Page', () => {
  test.describe.serial('Upload tests', () => {
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

      await userSession.snackbarContext.expect(
        'success',
        /Successfully submitted, redirecting you to submission ID:.*/i
      );
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

      await userSession.snackbarContext.expect(
        'success',
        /Successfully submitted, redirecting you to submission ID:.*/i
      );
      await test.step('Waiting for submission detail or report page', async () => {
        await Promise.race([
          userSession.submissionDetailPage.waitForPage({ timeout: LONG_TIMEOUT }),
          userSession.submissionReportPage.waitForPage({ timeout: LONG_TIMEOUT })
        ]);
      });
    });
  });
  test.describe('File Type Override tests', () => {
    // Ensure that the input is visible when interacting with the adjustment panel
    test('should display the file type override input in the adjust panel', async ({ userSession }) => {
      void userSession.crashPage.monitorForNoError();
      void userSession.notFoundPage.monitorForNoError();
      void userSession.forbiddenPage.monitorForNoError();
      void userSession.snackbarContext.monitorForNoError();

      await userSession.submitPage.goto();
      await userSession.submitPage.expectToBeVisible();
      await userSession.submitPage.adjustButton.click({ timeout: MEDIUM_TIMEOUT });
      await userSession.submitPage.fileTypeInput.expectVisible();
    });

    // Test input reset functionality by entering a value, resetting it, and ensuring the value is cleared
    test('should reset the file type override input value', async ({ userSession }) => {
      void userSession.crashPage.monitorForNoError();
      void userSession.notFoundPage.monitorForNoError();
      void userSession.forbiddenPage.monitorForNoError();
      void userSession.snackbarContext.monitorForNoError();

      await userSession.submitPage.goto();
      await userSession.submitPage.expectToBeVisible();
      await userSession.submitPage.adjustButton.click({ timeout: MEDIUM_TIMEOUT });
      await userSession.submitPage.fileTypeInput.inputValue('test/type');
      await userSession.submitPage.fileTypeInput.expectValue('test/type');
      await userSession.submitPage.fileTypeInput.resetValue();
      await userSession.submitPage.fileTypeInput.expectValue('');
    });

    // Ensure that if we're given a route /submit?fileType=some/type, the file type override input is pre-filled with that value
    // This simulates a user being given a link to submit with a file type override already set, and ensures that the value is correctly populated in the input (ie. submitting an existing submission)
    test('should set file type override via URL parameter', async ({ userSession }) => {
      void userSession.crashPage.monitorForNoError();
      void userSession.notFoundPage.monitorForNoError();
      void userSession.forbiddenPage.monitorForNoError();
      void userSession.snackbarContext.monitorForNoError();

      const fileType = 'executable/windows/pe64';
      await test.step(`Navigating to submit page with filetype_override="${fileType}"`, async () => {
        await userSession.page.goto(`/submit?params.filetype_override=${encodeURIComponent(fileType)}`);
      });
      await userSession.submitPage.expectToBeVisible();
      await userSession.submitPage.adjustButton.click({ timeout: MEDIUM_TIMEOUT });
      await userSession.submitPage.fileTypeInput.expectValue(fileType);
    });

    // Simulate a user specifying the type override through different methods of submission.
    ['File', 'Hash/URL'].forEach(tab => {
      test(`should allow manually setting a file type override value with ${tab} input`, async ({ userSession }) => {
        void userSession.crashPage.monitorForNoError();
        void userSession.notFoundPage.monitorForNoError();
        void userSession.forbiddenPage.monitorForNoError();
        void userSession.snackbarContext.monitorForNoError();

        // Set an invalid file type and expect an error message when attempting to submit
        const testFilePath = path.join(MOCKS_DIR, 'samples', 'test.txt');
        await userSession.submitPage.goto();
        await userSession.submitPage.expectToBeVisible();
        await userSession.submitPage.adjustButton.click({ timeout: MEDIUM_TIMEOUT });
        await userSession.submitPage.fileTypeInput.inputValue('bob');
        await userSession.submitPage.fileTypeInput.expectValue('bob');
        if (tab === 'File') {
          await userSession.submitPage.switchTab('File');
          await userSession.submitPage.uploadFile(testFilePath);
          await userSession.submitPage.clickSubmit();
          await userSession.snackbarContext.expect(
            'error',
            /The file you are trying to start did not upload properly, try again.../i
          );
        } else {
          await userSession.submitPage.switchTab('Hash/URL');
          const testFileHash = 'b6668cf8c46c7075e18215d922e7812ca082fa6cc34668d00a6c20aee4551fb6';
          await userSession.submitPage.uploadHash(testFileHash);
          await userSession.submitPage.clickSubmit();
          await userSession.snackbarContext.expect(
            'error',
            /Filetype override 'bob' is not a recognized file type in the system/i
          );
        }

        // Reset the value and expect it to be cleared
        await userSession.submitPage.fileTypeInput.resetValue();
        await userSession.submitPage.fileTypeInput.expectValue('');

        // Set a valid file type and expect it to be accepted when submitting
        await userSession.submitPage.fileTypeInput.inputValue('archive/zip');
        await userSession.submitPage.fileTypeInput.expectValue('archive/zip');
        await userSession.submitPage.clickSubmit();
        await userSession.snackbarContext.expect(
          'success',
          /Successfully submitted, redirecting you to submission ID:.*/i
        );
        await test.step('Waiting for submission detail or report page', async () => {
          await Promise.race([
            userSession.submissionDetailPage.waitForPage({ timeout: LONG_TIMEOUT }),
            userSession.submissionReportPage.waitForPage({ timeout: LONG_TIMEOUT })
          ]);
        });
      });
    });
  });
});
