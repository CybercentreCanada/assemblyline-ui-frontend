import type { Locator, Page } from '@playwright/test';
import { MEDIUM_TIMEOUT, SHORT_TIMEOUT } from 'e2e/shared/constants';
import { expect, test } from 'e2e/shared/fixtures';
import { BaseInput } from 'e2e/visual/Inputs/lib/Input.pom';

export class ChipsInput extends BaseInput {
  private readonly chipElements: Locator;
  private readonly clearButton: Locator;

  constructor(
    protected readonly page: Page,
    protected readonly id: string
  ) {
    super(page, 'ChipsInput', id);
    this.root = page.locator(`div[id="${id}-root"]`);
    this.input = this.root.locator(`input#${id}:not([aria-hidden="true"])`);
    this.chipElements = this.root.locator('.MuiAutocomplete-tag');
    this.clearButton = this.root.locator(`button[aria-label="${id}-clear"]`);
  }

  async inputValue(values: string[]) {
    await test.step(`Set ChipsInput "${this.id}" to "${values}"`, async () => {
      await this.clearValue();
      for (const val of values) {
        await this.addChip(val);
      }
    });
  }

  async addChip(value: string) {
    await test.step(`Add chip "${value}" to ChipsInput "${this.id}"`, async () => {
      await this.input.fill(value, { timeout: MEDIUM_TIMEOUT });
      await this.input.press('Enter');
    });
  }

  async removeChip(value: string) {
    await test.step(`Remove chip "${value}" from ChipsInput "${this.id}"`, async () => {
      const chip = this.chipElements.locator(`:has-text("${value}")`);
      const deleteButton = chip.locator('svg.MuiChip-deleteIcon');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
      }
    });
  }

  async clearValue() {
    await test.step(`Clear ChipsInput "${this.id}"`, async () => {
      await this.input.fill('', { timeout: MEDIUM_TIMEOUT });
    });
  }

  async expectValue(expected: string[]) {
    await test.step(`Expect ChipsInput "${this.id}" to have value "${expected}"`, async () => {
      await this.page.waitForTimeout(SHORT_TIMEOUT);
      const chips = await this.chipElements.allTextContents();
      expect(chips, `Chips in "${this.id}" did not match expected`).toEqual(expected);
    });
  }
}
