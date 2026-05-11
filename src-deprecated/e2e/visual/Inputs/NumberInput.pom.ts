import type { Page } from '@playwright/test';
import { MEDIUM_TIMEOUT, SHORT_TIMEOUT } from 'e2e/shared/constants';
import { expect, test } from 'e2e/shared/fixtures';
import { BaseInput } from 'e2e/visual/Inputs/lib/Input.pom';

export class NumberInput extends BaseInput {
  constructor(
    protected readonly page: Page,
    protected readonly id: string
  ) {
    super(page, 'NumberInput', id);
    this.root = page.locator(`div[id="${id}-root"]`);
    this.input = this.root.locator(`input[id="${id}"]`);
  }

  async inputValue(value: number | null | undefined) {
    const strValue = value === null || value === undefined ? '' : value.toString();
    await test.step(`Set NumberInput "${this.id}" to "${strValue}"`, async () => {
      await this.input.fill(strValue, { timeout: MEDIUM_TIMEOUT });
      await this.input.press('Tab');
    });
  }

  async clearValue() {
    await test.step(`Clear NumberInput "${this.id}"`, async () => {
      await this.input.fill('', { timeout: MEDIUM_TIMEOUT });
    });
  }

  async expectValue(expected: number | null | undefined) {
    const strValue = expected === null || expected === undefined ? '' : expected.toString();
    await test.step(`Expect NumberInput "${this.id}" to have value "${strValue}"`, async () => {
      await this.page.waitForTimeout(SHORT_TIMEOUT);
      await expect(this.input).toHaveValue(strValue, { timeout: MEDIUM_TIMEOUT });
    });
  }
}
