import type { Locator, Page } from '@playwright/test';
import { expect } from 'e2e/shared/fixtures';

export class ChipsInput {
  private root: Locator;
  private input: Locator;

  constructor(page: Page, ariaLabel: string) {
    this.root = page.locator(`[aria-label="${ariaLabel}"]`);
    this.input = this.root.locator('input');
  }

  async addChip(value: string) {
    await this.input.fill(value);
    await this.input.press('Enter');
  }

  async expectChip(value: string) {
    await expect(this.root.getByText(value)).toBeVisible();
  }

  async removeChip(value: string) {
    const chip = this.root.getByText(value);
    await chip.getByRole('button', { name: 'Remove' }).click();
  }
}
