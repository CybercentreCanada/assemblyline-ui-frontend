import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class NotFoundPage {
  constructor(private page: Page) {}

  async waitForPage() {
    await this.page.waitForURL('**/notfound');
    await expect(this.page.locator('h1')).toHaveText(/not found/i);
  }

  get message() {
    return this.page.locator('[data-testid="notfound-message"]');
  }
}
