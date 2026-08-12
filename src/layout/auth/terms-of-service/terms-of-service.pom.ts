import type { Locator, Page } from '@playwright/test';
import { SHORT_TIMEOUT } from 'app/spec.constant';
import type { WaitForOptions } from 'core/e2e/e2e.models';
import { test } from 'core/e2e/e2e.fixtures';
import { PageObjectModel } from 'core/e2e/utils/PageObjectModel';

export class TermsOfServicePage extends PageObjectModel {
  readonly header: Locator;
  readonly acceptButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page, 'Terms Of Service page', '/tos');

    this.header = page.getByRole('heading', { name: 'Terms of Service', exact: true });
    this.acceptButton = page.getByRole('button', { name: 'Accept terms', exact: true });
    this.logoutButton = page.getByRole('button', { name: 'Logout', exact: true });
  }

  locators(): Locator[] {
    return [this.header];
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await this.header.waitFor({ state, timeout });
  }

  async acceptIfVisible(options: WaitForOptions = {}) {
    return await test.step(`Accepting the ${this.name} when visible`, async () => {
      if (await this.isVisible(options)) {
        await this.acceptButton.click({ timeout: SHORT_TIMEOUT });
      }
    });
  }
}
