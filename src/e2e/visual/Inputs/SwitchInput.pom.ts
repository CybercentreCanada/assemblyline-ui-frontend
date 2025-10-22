import type { Locator, Page } from '@playwright/test';
import { expect } from 'e2e/shared/fixtures';

export class SwitchInput {
  private switch: Locator;

  constructor(page: Page, ariaLabel: string) {
    this.switch = page.getByRole('switch', { name: ariaLabel });
  }

  async toggle(state: boolean) {
    if (state) {
      await this.switch.check();
    } else {
      await this.switch.uncheck();
    }
  }

  async expectChecked() {
    await expect(this.switch).toBeChecked();
  }

  async expectUnchecked() {
    await expect(this.switch).not.toBeChecked();
  }
}
