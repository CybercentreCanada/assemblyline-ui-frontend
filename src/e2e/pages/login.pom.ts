import type { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from 'e2e/pages/base.pom';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs, WaitForOptions } from 'e2e/utils/playwright.models';

type LoginFixture = (r: LoginPage) => Promise<void>;

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;

  constructor(page: Page, logger: Logger, testInfo: TestInfo) {
    super(page, logger, testInfo, 'Login Page', '/');

    this.usernameInput = this.page.getByLabel('Username');
    this.passwordInput = this.page.getByLabel('Password');
    this.signInButton = this.page.getByRole('button', { name: 'Sign in' });
  }

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: LoginFixture, testInfo: TestInfo) => {
      const loginPage = new LoginPage(page, logger, testInfo);
      await use(loginPage);
    };

  async login(username: string, password: string) {
    this.logger.info(`Login Page: filling in ${username} credentials`);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    this.logger.info('Login Page: clicking the sign in button');
    await this.signInButton.click();
  }

  async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await super.waitFor({ state, timeout });
    await Promise.all([
      this.usernameInput.waitFor({ state, timeout }),
      this.passwordInput.waitFor({ state, timeout }),
      this.signInButton.waitFor({ state, timeout })
    ]);
  }

  async isVisible() {
    await super.isVisible();
    const results = await Promise.all([
      this.usernameInput.isVisible(),
      this.passwordInput.isVisible(),
      this.signInButton.isVisible()
    ]);
    return results.every(Boolean);
  }
}
