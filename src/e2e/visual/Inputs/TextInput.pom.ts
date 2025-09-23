import type { Locator, Page } from '@playwright/test';
import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { expect, test } from 'e2e/shared/fixtures';

export class TextInput {
  // readonly root: Locator;
  readonly input: Locator;
  // readonly label: Locator;
  readonly helperText: Locator;

  constructor(
    private readonly page: Page,
    private readonly label: string
  ) {
    this.input = page.locator(`[aria-label="${label}"]`).locator('input');
  }

  locators(): Locator[] {
    return [this.input];
  }

  async inputByValue(value: string) {
    await test.step(`Type into text input "${this.label}": ${value}`, async () => {
      await this.input.fill(value, { timeout: MEDIUM_TIMEOUT });
    });
  }

  async clear() {
    await test.step(`Clear text input "${this.label}"`, async () => {
      await this.input.fill('', { timeout: MEDIUM_TIMEOUT });
    });
  }

  async expectValue(value: string | RegExp, { timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect text input "${this.label}" to have value: ${value}`, async () => {
      await expect(this.input).toHaveValue(value, { timeout });
    });
  }

  async expectHelperText(text: string | RegExp, { timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect helper text for "${this.label}" to be: ${text}`, async () => {
      await expect(this.helperText).toHaveText(text, { timeout });
    });
  }

  async expectVisible({ timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect text input "${this.label}" to be visible`, async () => {
      await expect(this.input).toBeVisible({ timeout });
    });
  }

  async focus() {
    await test.step(`Focus text input "${this.label}"`, async () => {
      await this.input.focus();
    });
  }
}
