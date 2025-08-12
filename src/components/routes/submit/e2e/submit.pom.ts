import type { Page } from '@playwright/test';

export class SubmitPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }
}
