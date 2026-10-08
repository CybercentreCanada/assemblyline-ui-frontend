---
description: "Use when creating or modifying Playwright page objects, locators, and reusable browser interactions."
applyTo: "src/**/*.pom.ts, src/**/pom/**/*.ts"
---

# Page Object Model (POM) — AI Rules

> Applies to new and modified POMs. Existing POMs that differ are exempt until they are touched.

## Must

- Every page or component with E2E coverage has a POM
- Page POMs extend `PageObjectModel` and component POMs extend `ComponentObjectModel` (both in `core/e2e/utils/`)
- Constructor takes only a Playwright `Page` and passes it to `super` with a display name (and route for pages)
- Implement the abstract `locators()` and `waitForPage()` (pages) or `waitForComponent()` (components)
- Locators are `readonly` fields assigned in the constructor
- Multi-step interactions are async methods wrapped in `test.step()`
- Register page POMs on the `UserSession` in `core/e2e/e2e.fixtures.ts`
- Locator priority: `getByRole()` > `getByLabel()` > `getByText()` > `getByTestId()`

## Never

- NO test assertions in POMs beyond the helpers inherited from the base classes — assertions belong in specs
- NO raw selectors (CSS, XPath) — use Playwright's semantic locators
- NO combining multiple pages or components into one POM
- NO constructor dependencies other than `Page`
- NO shared state or singletons — the session fixture creates POMs per test

## Template

```typescript
import type { Locator, Page } from '@playwright/test';
import { test } from 'core/e2e/e2e.fixtures';
import type { WaitForOptions } from 'core/e2e/e2e.models';
import { PageObjectModel } from 'core/e2e/utils/PageObjectModel';

export class MyFeaturePage extends PageObjectModel {
  readonly heading: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page, 'My Feature page', '/my-feature');
    this.heading = this.page.getByRole('heading', { name: 'My Feature' });
    this.submitButton = this.page.getByRole('button', { name: 'Submit' });
  }

  locators(): Locator[] {
    return [this.heading, this.submitButton];
  }

  async submit() {
    await test.step('Clicking the submit button', async () => {
      await this.submitButton.click();
    });
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await Promise.all(this.locators().map(locator => locator.waitFor({ state, timeout })));
  }
}
```

## Placement

| Module shape        | POM location                                    |
| ------------------- | ----------------------------------------------- |
| File-based module   | `<module>.pom.ts` next to the module            |
| Folder-based module | `pom/<ComponentName>.pom.ts`                    |
| Reusable UI input   | beside the component, e.g. `src/ui/inputs/pom/` |
| Shared MUI wrappers | `core/e2e/components/`                          |
