import type { Locator, Page } from '@playwright/test';
import { LONG_TIMEOUT, SHORT_TIMEOUT } from 'e2e/shared/constants';
import { test } from 'e2e/shared/fixtures';
import type { WaitForOptions } from 'e2e/shared/models';
import { PageObjectModel } from 'e2e/utils/PageObjectModel';

export class WorkflowDetailPage extends PageObjectModel {
  private readonly title: Locator;

  constructor(page: Page) {
    super(page, 'Workflow detail page', '/manage/workflow/detail');
    this.title = page.getByRole('heading', { name: 'Workflow Detail' });
  }

  override async goto(id: string) {
    await test.step(`Navigating to the ${this.name}`, async () => {
      await this.page.goto(`${this.route}/${id}`, { timeout: LONG_TIMEOUT });
    });
  }

  locators(): Locator[] {
    return [this.title];
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await test.step(`Wait for ${this.name}`, async () => {
      await this.title.waitFor({ state, timeout });
    });
  }

  async removeWorkflow() {
    await test.step('Removing the workflow', async () => {
      const removeButton = this.page.locator('div[aria-label="Remove workflow"] > button').first();
      await removeButton.waitFor({ state: 'visible', timeout: SHORT_TIMEOUT });
      await removeButton.click({ timeout: SHORT_TIMEOUT });

      const confirmButton = this.page.locator('div[role="dialog"] >> text=Yes, remove it!').first();
      await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
      await confirmButton.click({ timeout: 5000 });
    });
  }
}
