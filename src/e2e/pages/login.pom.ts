import type { Locator, Page } from '@playwright/test';
import { test } from 'e2e/configs/playwright.fixtures';
import type { WaitForOptions } from 'e2e/configs/playwright.models';
import { PageObjectModel } from 'e2e/utils/PageObjectModel';

export class LoginPage extends PageObjectModel {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;

  constructor(page: Page) {
    super(page, 'Login page', '/');
    this.usernameInput = this.page.getByLabel('Username');
    this.passwordInput = this.page.getByLabel('Password');
    this.signInButton = this.page.getByRole('button', { name: 'Sign in' });
  }

  async login(username: string, password: string) {
    test.info().project.use.baseURL;
    await test.step(`Filling in the "${username}" credentials`, async () => {
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
    });

    await test.step('Clicking the sign in button', async () => {
      await this.signInButton.click();
    });
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await Promise.all([
      this.usernameInput.waitFor({ state, timeout }),
      this.passwordInput.waitFor({ state, timeout }),
      this.signInButton.waitFor({ state, timeout })
    ]);
  }
}
