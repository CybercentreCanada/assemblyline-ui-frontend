import type { Page } from '@playwright/test';
import { expect, test } from 'core/e2e/e2e.fixtures';

// Replace route parameters with dummy test values
const routes = [
  '/',
  '/account',
  '/admin',
  '/admin/actions',
  '/admin/apikeys',
  '/admin/apikeys/123',
  '/admin/errors',
  '/admin/errors/error-key',
  '/admin/identify',
  '/admin/service_review',
  '/admin/services',
  '/admin/services/service-1',
  '/admin/sitemap',
  '/admin/tag_safelist',
  '/admin/users',
  '/admin/users/42',
  '/alerts_redirect',
  '/alerts',
  '/alerts/alert-1',
  '/archive',
  '/archive/archive-1',
  '/archive/archive-1/details',
  '/authorize',
  '/crash',
  '/dashboard',
  '/development/customize',
  '/development/library',
  '/development/theme',
  '/file/detail/file-123',
  '/file/viewer/file-123',
  '/file/viewer/file-123/details',
  '/forbidden',
  '/help',
  '/help/api',
  '/help/classification',
  '/help/configuration',
  '/help/search',
  '/help/services',
  '/logout',
  '/manage',
  '/manage/badlist',
  '/manage/badlist/item-1',
  '/manage/heuristic/heuristic-1',
  '/manage/heuristics',
  '/manage/safelist',
  '/manage/safelist/safe-1',
  '/manage/signature/sig-1',
  '/manage/signature/type/source/name',
  '/manage/signatures',
  '/manage/sources',
  '/manage/workflow/create/wf-1',
  '/manage/workflow/detail/wf-1',
  '/manage/workflows',
  '/notfound',
  '/retrohunt',
  '/retrohunt/key-1',
  '/search',
  '/search/query-1',
  '/settings',
  '/settings/general',
  '/submission/sub-1',
  '/submission/detail/sub-1',
  '/submission/detail/sub-1/file-1',
  '/submission/report/sub-1',
  '/submissions',
  '/submit',
  '/tos'
];

const routeToSnapshotName = (route: string): string => {
  const normalized = route === '/' ? 'root' : route.slice(1);
  const safeName = normalized.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `route-${safeName}.png`;
};

const waitForVisualReady = async (page: Page) => {
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('body')).toBeVisible();

  const signingInText = page.getByText('Signing you in...');
  if ((await signingInText.count()) > 0) {
    await expect(signingInText.first()).toBeHidden({ timeout: 30_000 });
  }

  await expect
    .poll(
      async () =>
        await page.evaluate(() => {
          const isVisible = (el: Element) => {
            const html = el as HTMLElement;
            const style = window.getComputedStyle(html);
            const rect = html.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          };

          return Array.from(document.querySelectorAll('[role="progressbar"]')).filter(isVisible).length;
        }),
      { message: 'Waiting for loading indicators to disappear', timeout: 30_000 }
    )
    .toBe(0);

  await page.evaluate(
    () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  );
};

test.describe('Route Smoke Tests', () => {
  for (const route of routes) {
    test(`should load ${route} without errors and match snapshot`, async ({ page }) => {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response, `No response for ${route}`).not.toBeNull();

      const status = response.status();
      expect(status, `Unexpected status for ${route}`).toBeLessThan(400);

      expect(errors, `Console errors for ${route}: ${errors.join('\n')}`).toHaveLength(0);

      await waitForVisualReady(page);

      await expect(page).toHaveScreenshot(routeToSnapshotName(route), {
        animations: 'disabled',
        fullPage: true
      });
    });
  }
});
