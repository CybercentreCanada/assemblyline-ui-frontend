import type { Locator, Page } from '@playwright/test';
import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { test } from 'e2e/shared/fixtures';
import type { WaitForOptions } from 'e2e/shared/models';
import { PageObjectModel } from 'e2e/utils/PageObjectModel';

export class WorkflowsPage extends PageObjectModel {
  private readonly title: Locator;
  private readonly createButton: Locator;

  constructor(page: Page) {
    super(page, 'Workflows page', '/manage/workflows');
    this.title = page.getByRole('heading', { name: 'Workflows' });
    this.createButton = page.getByRole('button', { name: 'Add workflow' });
  }

  locators(): Locator[] {
    return [this.title];
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await test.step(`Wait for ${this.name}`, async () => {
      await this.title.waitFor({ state, timeout });
    });
  }

  async clickCreateWorkflowButton() {
    await test.step('Clicking the Create Workflow button', async () => {
      await this.createButton.click({ timeout: MEDIUM_TIMEOUT });
    });
  }
}
