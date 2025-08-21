import type { Locator, Page } from '@playwright/test';
import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { expect, test } from 'e2e/shared/fixtures';
import type { WaitForOptions } from 'e2e/shared/models';
import { PageObjectModel } from 'e2e/utils/PageObjectModel';

export class AccountPage extends PageObjectModel {
  // readonly header: Locator;
  // readonly acceptButton: Locator;
  // readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page, 'Account page', '/account');

    // this.header = page.getByRole('heading', { name: 'Terms of Service', exact: true });
    // this.acceptButton = page.getByRole('button', { name: 'Accept terms', exact: true });
    // this.logoutButton = page.getByRole('button', { name: 'Logout', exact: true });
  }

  locators(): Locator[] {
    return [];
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    // await Promise.all([this.header.waitFor({ state, timeout })]);
  }

  override async expectToBeVisible({ timeout = MEDIUM_TIMEOUT }: WaitForOptions = {}, email: string = null) {
    await test.step(`Expect the ${this.name} to become visible`, async () => {
      await expect(this.page.getByText(email)).toBeVisible({ timeout });
    });
  }
}
