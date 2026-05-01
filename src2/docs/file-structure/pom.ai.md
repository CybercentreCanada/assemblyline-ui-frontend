# Page Object Model (POM) — AI Rules

## Must

- Every component with E2E coverage must have a `<ComponentName>.pom.ts` in a `pom/` folder
- Constructor must take only a Playwright `Page` instance
- Locators must be exposed as getters (not methods)
- Multi-step interactions must be exposed as async methods
- Locator priority: `getByRole()` > `getByLabel()` > `getByText()` > `getByTestId()`
- POM getters must return Playwright `Locator` objects

## Never

- NO assertions inside POMs — assertions belong in specs
- NO raw selectors (CSS, XPath) — use Playwright's semantic locators
- NO combining multiple components into one POM
- NO dependencies in constructor other than `Page`
- NO shared state or singletons — instantiate per test

## Template

```typescript
import type { Page } from '@playwright/test';

export class MyFeaturePOM {
  constructor(private page: Page) {}

  get container() {
    return this.page.getByTestId('my-feature');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  get items() {
    return this.container.getByTestId('item');
  }

  async submit() {
    await this.submitButton.click();
  }

  async waitForLoaded() {
    await this.container.waitFor({ state: 'visible' });
  }
}
```

## Placement

| File | Location |
|------|----------|
| POM | `pom/<ComponentName>.pom.ts` |
| Adjacent to | `<module>.components.tsx` |
