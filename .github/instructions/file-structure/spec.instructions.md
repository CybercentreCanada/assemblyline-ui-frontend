---
description: "Use when creating or modifying Playwright end-to-end tests and user-facing browser scenarios."
applyTo: "src/**/*.spec.ts, src/e2e/**/*.ts, src/**/spec/**/*.ts"
---

# Spec Files (E2E Tests) — AI Rules

> Applies to new and modified specs. Existing specs that differ are exempt until they are touched.

## Must

- Every spec interacts with the UI through POMs obtained from the `userSession` or `adminSession` fixture
- Import `test` and `expect` from `core/e2e/e2e.fixtures`, not `@playwright/test`
- One `test.describe` per page or component
- Take POMs from the session fixture inside each test — no module-level POM instances
- Use the timeout constants from `app/spec.constant` (`SHORT_TIMEOUT`, `MEDIUM_TIMEOUT`, `LONG_TIMEOUT`)
- Wrap multi-step flows in `test.step()`
- Test names describe user-facing behavior
- Assertions use Playwright locator matchers (`toBeVisible`, `toHaveCount`, `toContainText`)
- Flows that need an unauthenticated context (login) create their own context and bind a POM to it with `usePage(page)`

## Never

- NO raw locators in spec files — all DOM access through POMs
- NO module-level or `beforeEach` POM instances shared between tests
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

| Module shape        | Spec location           |
| ------------------- | ----------------------- |
| File-based module   | `<module>.spec.ts`      |
| Folder-based module | `spec/<module>.spec.ts` |

The POMs a spec uses are registered on the session in `core/e2e/e2e.fixtures.ts`.
