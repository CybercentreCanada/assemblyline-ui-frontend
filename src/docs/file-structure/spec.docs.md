# Spec Files (E2E Tests)

## Purpose

Spec files are Playwright E2E tests that verify user-facing behavior through the browser. They interact with the UI exclusively through POMs — never directly with the DOM. This ensures specs remain stable when component internals change.

## File Structure

```text
module/
  my-feature.components.tsx
  pom/
    MyFeature.pom.ts
  spec/
    my-feature.spec.ts
```

- Spec files live in a `spec/` folder adjacent to the component
- File naming: `<module>.spec.ts` (kebab-case matching the component file)

## Structure

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

## Rules

- Import `test` and `expect` from `@playwright/test`
- One `test.describe` per feature/component
- Instantiate POMs inside each test — no shared state between tests
- All DOM interaction must go through the POM — never use raw locators in specs
- Test names must describe the user behavior being verified
- Assertions use Playwright's `expect` with locator matchers (`toHaveCount`, `toContainText`, `toBeVisible`)
