import type { Locator, Page } from '@playwright/test';
import type { WaitForOptions } from 'core/e2e/e2e.models';
import { PageObjectModel } from 'core/e2e/utils/PageObjectModel';

export class NotFoundPage extends PageObjectModel {
  readonly deadLinkTitle: Locator;
  readonly deadLinkDescription: Locator;

  constructor(page: Page) {
    super(page, 'Not Found page', '*');

    this.deadLinkTitle = page.getByRole('heading', { name: 'This page took a wrong turn' });
    this.deadLinkDescription = page.getByRole('heading', { name: /The route you requested could not be found/ });
  }

  locators(): Locator[] {
    return [this.deadLinkTitle, this.deadLinkDescription];
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await Promise.all([
      this.deadLinkTitle.waitFor({ state, timeout }),
      this.deadLinkDescription.waitFor({ state, timeout })
    ]);
  }
}
