import type { Locator, Page } from '@playwright/test';
import { expect } from 'e2e/shared/fixtures';

export class DateInput {
  private input: Locator;

  constructor(page: Page, ariaLabel: string) {
    this.input = page.locator(`[aria-label="${ariaLabel}"] input[type="text"]`);
  }

  async inputByValue(value: string) {
    await this.input.fill(value);
  }

  async expectValue(expected: string) {
    await expect(this.input).toHaveValue(expected);
  }
}
