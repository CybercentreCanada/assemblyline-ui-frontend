# Spec Files (E2E Tests) — AI Rules

## Must

- Every spec must interact with the UI exclusively through POMs
- Import `test` and `expect` from `@playwright/test`
- One `test.describe` per feature/component
- Instantiate POM inside each test — no shared state between tests
- Test names must describe user-facing behavior
- Assertions must use Playwright locator matchers (`toBeVisible`, `toHaveCount`, `toContainText`)

## Never

- NO raw locators in spec files — all DOM access through POMs
- NO shared POM instances between tests (no `beforeEach` POM setup)
- NO implementation details in test names
- NO CSS selectors or XPath in specs

## Template

```typescript
import { expect, test } from '@playwright/test';
import { MyFeaturePOM } from '../pom/MyFeature.pom';

test.describe('MyFeature', () => {
  test('displays items after loading', async ({ page }) => {
    const feature = new MyFeaturePOM(page);
    await page.goto('/my-feature');
    await feature.waitForLoaded();

    await expect(feature.items).toHaveCount(3);
  });

  test('submits successfully', async ({ page }) => {
    const feature = new MyFeaturePOM(page);
    await page.goto('/my-feature');
    await feature.waitForLoaded();
    await feature.submit();

    await expect(feature.container).toContainText('Success');
  });
});
```

## Placement

| File | Location |
|------|----------|
| Spec | `spec/<module>.spec.ts` |
| Adjacent to | `pom/<ComponentName>.pom.ts` |
