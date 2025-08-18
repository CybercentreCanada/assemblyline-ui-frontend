import type { Locator, Page } from '@playwright/test';
import type { WaitForOptions } from 'e2e/configs/playwright.models';
import { PageObjectModel } from 'e2e/utils/PageObjectModel';

export class CrashPage extends PageObjectModel {
  private readonly errorFallback: Locator;

  constructor(page: Page) {
    super(page, 'Crash page', '/crash');
    this.errorFallback = page.locator('[data-testid="error-fallback"]');
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await this.errorFallback.waitFor({ state, timeout });
  }
}
