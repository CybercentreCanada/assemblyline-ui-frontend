import type { Locator, Page } from '@playwright/test';
import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { expect, test } from 'e2e/shared/fixtures';

export abstract class BaseInput {
  protected root: Locator;
  protected input: Locator;
  protected helperText: Locator;

  constructor(
    protected readonly page: Page,
    protected readonly type: string,
    protected readonly id: string
  ) {}

  async expectVisible({ timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect ${this.type} "${this.id}" to be visible`, async () => {
      await expect(this.root).toBeVisible({ timeout });
    });
  }

  abstract inputValue(value: unknown): Promise<void>;

  abstract expectValue(value: unknown): Promise<void>;

  async resetValue() {
    await test.step(`Reset ${this.type} "${this.id}" using the reset button`, async () => {
      const resetButton = this.root.locator(`button[aria-label="${this.id}-reset"]`);
      await resetButton.click({ timeout: MEDIUM_TIMEOUT });
    });
  }

  async expectHelperText(text: string | RegExp, { timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect helper text for "${this.id}" to be: ${text}`, async () => {
      await expect(this.helperText).toHaveText(text, { timeout });
    });
  }

  async expectToBeDisabled({ timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect ${this.type} "${this.id}" to be disabled`, async () => {
      await expect(this.input).toBeDisabled({ timeout });
    });
  }

  async expectToBeLoading({ timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect ${this.type} "${this.id}" to be loading`, async () => {
      const skeleton = this.root.locator(`.MuiSkeleton-root`);
      await expect(skeleton).toBeVisible({ timeout });
    });
  }

  async expectToHaveReset({ timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect ${this.type} "${this.id}" to have reset`, async () => {
      const resetButton = this.root.locator(`button[aria-label="${this.id}-reset"]`);
      await expect(resetButton).toBeVisible({ timeout });
    });
  }

  async expectToBeReadonly({ timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect ${this.type} "${this.id}" to be readonly`, async () => {
      await expect(this.input).toHaveAttribute('readonly', '', { timeout });
    });
  }

  async expectHelperTextToBe(expected: string, { timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect ${this.type} "${this.id}" helper text to be "${expected}"`, async () => {
      const helperText = this.root.locator(`#${this.id}-helper-text`);
      await expect(helperText).toHaveText(expected, { timeout });
    });
  }

  async focus() {
    await test.step(`Focus ${this.type} "${this.id}"`, async () => {
      await this.input.focus();
    });
  }
}
