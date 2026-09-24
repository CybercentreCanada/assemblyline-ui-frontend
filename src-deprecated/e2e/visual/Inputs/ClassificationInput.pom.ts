import type { Locator, Page } from '@playwright/test';
import { expect } from 'e2e/shared/fixtures';

export class ClassificationInput {
  private root: Locator;

  constructor(page: Page, ariaLabel: string) {
    this.root = page.locator(`[aria-label="${ariaLabel}"]`);
  }

  async select(label: string) {
    await this.root.getByRole('button', { name: label }).click();
  }

  async expectSelected(label: string) {
    await expect(this.root.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'true');
  }
}
