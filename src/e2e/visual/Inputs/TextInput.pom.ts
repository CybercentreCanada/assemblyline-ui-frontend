import type { Page } from '@playwright/test';
import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { expect, test } from 'e2e/shared/fixtures';
import { BaseInput } from 'e2e/visual/Inputs/lib/Input.pom';

export class TextInput extends BaseInput {
  constructor(
    protected readonly page: Page,
    protected readonly id: string
  ) {
    super(page, 'TextInput', id);
    this.root = page.locator(`div[id="${id}-root"]`);
    this.input = this.root.locator(`input[id="${id}"]`);
  }

  async inputValue(value: string) {
    await test.step(`Type into TextInput "${this.id}": ${value}`, async () => {
      await this.input.fill(value, { timeout: MEDIUM_TIMEOUT });
    });
  }

  async clearValue() {
    await test.step(`Clear TextInput "${this.id}"`, async () => {
      await this.input.fill('', { timeout: MEDIUM_TIMEOUT });
    });
  }

  override async expectValue(value: string | RegExp, { timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect TextInput "${this.id}" to have value: ${value}`, async () => {
      await expect(this.input).toHaveValue(value, { timeout });
    });
  }
}
