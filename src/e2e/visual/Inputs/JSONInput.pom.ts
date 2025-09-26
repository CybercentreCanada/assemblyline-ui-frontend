import type { Locator, Page } from '@playwright/test';
import { expect } from 'e2e/shared/fixtures';

export class JSONInput {
  private editor: Locator;

  constructor(page: Page, ariaLabel: string) {
    this.editor = page.locator(`[aria-label="${ariaLabel}"] textarea`);
  }

  async inputJSON(json: object) {
    await this.editor.fill(JSON.stringify(json, null, 2));
  }

  async expectJSON(expected: object) {
    await expect(this.editor).toHaveValue(JSON.stringify(expected, null, 2));
  }
}
