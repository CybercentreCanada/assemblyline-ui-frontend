import { test } from 'e2e/configs/playwright.fixtures';

test.describe('Not Found Page', () => {
  test('should detect the dead link page', async ({ notFoundPage, errorBoundary, page, forbiddenPage }) => {
    void errorBoundary.expectNoErrors();
    void forbiddenPage.expectNoErrors();

    void notFoundPage.expectErrors();

    await page.goto('/doesnt_exist');
    await page.waitForTimeout(2_000);
  });
});

// type Fixtures = {
//   logger: Logger;
//   errorBoundary: ErrorBoundary;
//   crashPage: CrashPage;
//   notFoundPage: NotFoundPage;
// };

// test.describe('Not Found Page', () => {
//   test('should detect the dead link page', async ({ notFoundPage, errorBoundary, page }) => {
//     const navigateToDeadLink = async () => {
//       await page.goto('/doesnt_exist');
//       await page.waitForTimeout(5_000);
//     };

//     const { error } = await tryCatchRace([navigateToDeadLink(), errorBoundary.waitFor(), notFoundPage.waitFor()]);

//     if (errorBoundary.isError(error)) await errorBoundary.expectNotVisible();
//     if (notFoundPage.isError(error)) await notFoundPage.expectVisible();
//   });
// });
