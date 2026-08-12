import type { Locator, Page } from '@playwright/test';
import type { WaitForOptions } from 'core/e2e/e2e.models';
import { PageObjectModel } from 'core/e2e/utils/PageObjectModel';

export class ForbiddenPage extends PageObjectModel {
  readonly forbiddenTitle: Locator;
  readonly forbiddenMessage: Locator;

  constructor(page: Page) {
    super(page, 'Forbidden page', '/forbidden');

    this.forbiddenTitle = page.getByRole('heading', { name: 'Nice try, this door is locked' });
    this.forbiddenMessage = page.getByRole('heading', { name: /You are not allowed to view this page/ });
  }

  locators(): Locator[] {
    return [this.forbiddenTitle, this.forbiddenMessage];
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await Promise.all([
      this.forbiddenTitle.waitFor({ state, timeout }),
      this.forbiddenMessage.waitFor({ state, timeout })
    ]);
  }
}
