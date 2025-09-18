import { test } from 'components/routes/submit/e2e/submit.fixture';

// test.describe('Submit page', () => {
//   // test('test a second page', async ({ context, page }) => {
//   //   const cookies = await context.cookies();
//   //   console.log('Loaded cookies:', cookies);

//   //   // Optional: check for specific cookies
//   //   const xsrfCookie = cookies.find(c => c.name === 'XSRF-TOKEN');
//   //   console.log('XSRF-TOKEN cookie:', xsrfCookie);

//   //   await page.goto('/');
//   //   const bannerImage = page.locator('img[alt="Assemblyline Banner"]');
//   //   await page.locator('img[alt="Assemblyline Banner"]').waitFor({ timeout: 60000 });
//   //   await expect(bannerImage).toBeVisible();
//   //   await page.waitForTimeout(5000);
//   // });

//   test('testing the ErrorBoundary', async ({ page }) => {
//     let pageCrashed = false;
//     page.on('crash', () => {
//       pageCrashed = true;
//     });

//     await page.goto('/');
//     await page.waitForTimeout(10000);

//     expect(pageCrashed).toBe(true);

//     // const bannerImage = page.locator('img[alt="Assemblyline Banner"]');
//     // await page.locator('img[alt="Assemblyline Banner"]').waitFor({ timeout: 60000 });
//     // await expect(bannerImage).toBeVisible();
//     // await page.waitForTimeout(5000);
//   });
// });

test.describe('Submit page', () => {
  test('Smoke test', async ({ submitPage }) => {
    await submitPage.goto();
  });
});
