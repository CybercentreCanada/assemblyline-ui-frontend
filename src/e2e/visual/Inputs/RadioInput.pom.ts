import type { Locator, Page } from '@playwright/test';
import { expect } from 'e2e/shared/fixtures';

export class RadioInput {
  private root: Locator;

  constructor(page: Page, ariaLabel: string) {
    this.root = page.getByRole('radiogroup', { name: ariaLabel });
  }

  async select(label: string) {
    await this.root.getByRole('radio', { name: label }).check();
  }

  async expectSelected(label: string) {
    await expect(this.root.getByRole('radio', { name: label })).toBeChecked();
  }
}
