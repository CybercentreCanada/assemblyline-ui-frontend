import type { Page } from '@playwright/test';
import { MEDIUM_TIMEOUT, SHORT_TIMEOUT } from 'e2e/shared/constants';
import { expect, test } from 'e2e/shared/fixtures';
import { BaseInput } from 'e2e/visual/Inputs/lib/Input.pom';

export class TextAreaInput extends BaseInput {
  constructor(
    protected readonly page: Page,
    protected readonly id: string
  ) {
    super(page, 'TextAreaInput', id);
    this.root = page.locator(`div[id="${id}-root"]`);
    this.input = this.root.locator(`textarea#${id}:not([aria-hidden="true"])`);
  }

  async inputValue(value: string) {
    await test.step(`Set TextAreaInput "${this.id}" to "${value}"`, async () => {
      await this.input.fill(value, { timeout: MEDIUM_TIMEOUT });
      await this.input.press('Tab');
    });
  }

  async clearValue() {
    await test.step(`Clear TextAreaInput "${this.id}"`, async () => {
      await this.input.fill('', { timeout: MEDIUM_TIMEOUT });
    });
  }

  async expectValue(expected: string) {
    await test.step(`Expect TextAreaInput "${this.id}" to have value "${expected}"`, async () => {
      await this.page.waitForTimeout(SHORT_TIMEOUT);
      await expect(this.input).toHaveValue(expected, { timeout: MEDIUM_TIMEOUT });
    });
  }
}
