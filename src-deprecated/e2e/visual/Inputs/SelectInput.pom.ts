import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { SHORT_TIMEOUT } from 'e2e/shared/constants';
import { test } from 'e2e/shared/fixtures';

export type SelectOptions = readonly { label: string; value: string }[];

export class SelectInput<Options extends SelectOptions> {
  private readonly page: Page;
  private readonly combobox: Locator;
  private readonly selectButton: Locator;
  private readonly optionBox: Locator;
  private readonly labelledBy: string;

  constructor(page: Page, labelledBy: string) {
    this.page = page;
    this.labelledBy = labelledBy;
    this.combobox = page.locator(`div[aria-labelledby="${labelledBy}"]`);
    this.selectButton = page.getByRole('button', { name: `${labelledBy}-select-menu` });
    this.optionBox = page.locator('ul[role="listbox"]');
  }

  async open() {
    await test.step(`Opening select dropdown: "${this.labelledBy}"`, async () => {
      await this.combobox.click({ timeout: SHORT_TIMEOUT });
      await this.optionBox.first().waitFor({ state: 'visible', timeout: SHORT_TIMEOUT });
    });
  }

  async inputByLabel(label: Options[number]['label']) {
    await test.step(`Selecting option by label: "${label}" in "${this.labelledBy}"`, async () => {
      await this.open();
      const option = this.page.getByRole('option', { name: label }).first();
      await option.click();
    });
  }

  async inputByValue(value: Options[number]['value']) {
    await test.step(`Selecting option by value: "${value}" in "${this.labelledBy}"`, async () => {
      await this.open();
      const option = this.page.locator(`ul[role="listbox"] >> li[data-value="${value}"]`).first();
      await option.click();
    });
  }

  async getSelectedText(): Promise<string> {
    return await test.step(`Getting selected option text from "${this.labelledBy}"`, async () => {
      return this.combobox.innerText();
    });
  }

  async expectSelected(
    optionText: string,
    options?: { ignoreCase?: boolean; timeout?: number; useInnerText?: boolean }
  ) {
    await test.step(`Expecting selected option to be: "${optionText}" in "${this.labelledBy}"`, async () => {
      await expect(this.combobox).toHaveText(optionText, {
        ignoreCase: false,
        timeout: SHORT_TIMEOUT,
        useInnerText: false,
        ...options
      });
    });
  }
}
