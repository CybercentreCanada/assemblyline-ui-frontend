import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class ForbiddenPage {
  constructor(private page: Page) {}

  async waitForPage() {
    await this.page.waitForURL('**/forbidden');
    await expect(this.page.locator('h1')).toHaveText(/forbidden/i);
  }

  get message() {
    return this.page.locator('[data-testid="forbidden-message"]');
  }
}
