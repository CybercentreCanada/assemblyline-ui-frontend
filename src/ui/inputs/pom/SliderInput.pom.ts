import type { Locator, Page } from '@playwright/test';
import { expect } from 'core/e2e/e2e.fixtures';

export class SliderInput {
  private slider: Locator;

  constructor(page: Page, ariaLabel: string) {
    this.slider = page.getByRole('slider', { name: ariaLabel });
  }

  async setValue(value: number) {
    await this.slider.fill(value.toString());
  }

  async expectValue(value: number) {
    await expect(this.slider).toHaveValue(value.toString());
  }
}
