import type { Locator, Page } from '@playwright/test';
import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { expect, test } from 'e2e/shared/fixtures';
import { BaseInput } from 'e2e/visual/Inputs/lib/Input.pom';

const IS_CHECKED =
  'svg.MuiSvgIcon-root path[d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"]';
const IS_UNCHECKED =
  'svg.MuiSvgIcon-root path[d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"]';

export class CheckboxInput extends BaseInput {
  readonly checked: Locator;
  readonly unchecked: Locator;

  constructor(
    protected readonly page: Page,
    protected readonly id: string
  ) {
    super(page, 'CheckboxInput', id);
    this.root = page.locator(`form[id="${id}-form"]`);
    // this.input = this.root.locator(`input[type="checkbox"]`);
    // this.input = this.root.locator('button', { has: page.locator(`span:text-is("${id}")`) });
    this.input = this.root.locator('button').first();
    this.checked = this.input.locator(IS_CHECKED);
    this.unchecked = this.input.locator(IS_UNCHECKED);
  }

  async inputValue(value: boolean) {
    await test.step(`Set CheckboxInput "${this.id}" to ${value}`, async () => {
      const visible = await this.checked.isVisible({ timeout: MEDIUM_TIMEOUT });
      if (value !== visible) await this.input.click({ timeout: MEDIUM_TIMEOUT });
    });
  }

  async expectValue(value: boolean) {
    await test.step(`Expect CheckboxInput "${this.id}" to have value: ${value}`, async () => {
      const visible = await this.checked.isVisible({ timeout: MEDIUM_TIMEOUT });
      expect(visible).toBe(value);
    });
  }

  async expectVisible({ timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect CheckboxInput "${this.id}" to be visible`, async () => {
      await expect(this.input).toBeVisible({ timeout });
    });
  }

  override async expectToBeReadonly({ timeout = MEDIUM_TIMEOUT } = {}) {
    await test.step(`Expect ${this.type} "${this.id}" to be readonly`, async () => {
      await expect(this.input).toBeDisabled();
    });
  }
}
