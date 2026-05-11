
# Page Object Model (POM)

## Purpose

Every component that has E2E coverage must have a corresponding POM file. The POM encapsulates all locators and interactions for that component, providing a stable API that spec files use to interact with the UI. When the component's DOM changes, only the POM needs updating — specs remain untouched.

## File Structure

```text
module/
  my-feature.components.tsx
  pom/
    MyFeature.pom.ts
  spec/
    my-feature.spec.ts
```

- POM files live in a `pom/` folder adjacent to the component
- File naming: `<ComponentName>.pom.ts` (PascalCase matching the component)
- One POM class per component

## Anatomy of a POM

A POM has three parts:

1. **Constructor** — receives a Playwright `Page` instance
2. **Locator getters** — expose elements as getters (never raw selectors in specs)
3. **Interaction methods** — encapsulate multi-step interactions as async methods

```typescript
import type { Page } from '@playwright/test';

export class MyFeaturePOM {
  constructor(private page: Page) {}

  // Locator getters
  get container() {
    return this.page.getByTestId('my-feature');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  get items() {
    return this.container.getByTestId('item');
  }

  get errorMessage() {
    return this.container.getByRole('alert');
  }

  // Interaction methods
  async submit() {
    await this.submitButton.click();
  }

  async waitForLoaded() {
    await this.container.waitFor({ state: 'visible' });
  }
}
```

## Locator Strategy

POMs use the same locator priority as the accessibility conventions:

1. `getByRole()` — roles + aria labels (preferred)
2. `getByLabel()` — `aria-label` or `<label>`
3. `getByText()` — visible text
4. `getByTestId()` — `data-testid` fallback

This means components must have proper aria attributes and `data-testid` on elements that lack semantic locators.

## Rules

- One POM per component — never combine multiple components into one POM
- Locators exposed as getters — never as methods that compute locators
- Complex interactions (multi-click, fill + submit) exposed as async methods
- No assertions inside POMs — assertions belong exclusively in spec files
- Constructor takes only `Page` — no other dependencies
- POM getters return Playwright `Locator` objects (not resolved elements)
