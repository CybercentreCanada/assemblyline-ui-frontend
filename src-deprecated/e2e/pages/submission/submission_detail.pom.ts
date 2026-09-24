import type { Locator, Page } from '@playwright/test';
import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import type { WaitForOptions } from 'e2e/shared/models';
import { PageObjectModel } from 'e2e/utils/PageObjectModel';

export class SubmissionDetailPage extends PageObjectModel {
  private readonly title: Locator;

  constructor(page: Page) {
    super(page, 'Submission Detail page', '/submission/detail/:sid');

    this.title = page.getByRole('heading', { name: /Submission Details/i });
  }

  locators(): Locator[] {
    return [this.title];
  }

  async waitForPage({ state = 'visible', timeout = MEDIUM_TIMEOUT }: WaitForOptions = {}) {
    await this.title.waitFor({ state, timeout });
  }
}
