import type { Locator, Page } from '@playwright/test';
import type { WaitForOptions } from 'core/e2e/e2e.models';
import { PageObjectModel } from 'core/e2e/utils/PageObjectModel';

export class NotFoundPage extends PageObjectModel {
  readonly deadLinkTitle: Locator;
  readonly deadLinkDescription: Locator;

  constructor(page: Page) {
    super(page, 'Not Found page', '*');

    this.deadLinkTitle = page.getByText(`404: Not found`);
    this.deadLinkDescription = page.getByText(`The page you are looking for cannot be found...`, { exact: true });
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
