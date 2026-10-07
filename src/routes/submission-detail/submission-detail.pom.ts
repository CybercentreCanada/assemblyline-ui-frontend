import type { Locator, Page } from '@playwright/test';
import { MEDIUM_TIMEOUT } from 'app/spec.constant';
import type { WaitForOptions } from 'core/e2e/e2e.models';
import { PageObjectModel } from 'core/e2e/utils/PageObjectModel';

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
