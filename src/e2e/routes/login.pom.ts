import type { Locator, Page } from '@playwright/test';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs, WaitForOptions } from 'e2e/utils/playwright.models';

type LoginFixture = (r: LoginPage) => Promise<void>;

export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;

  constructor(
    private page: Page,
    private logger: Logger
  ) {
    this.logger.info('Login Page: Initializing locators');
    this.usernameInput = this.page.getByLabel('Username');
    this.passwordInput = this.page.getByLabel('Password');
    this.signInButton = this.page.getByRole('button', { name: 'Sign in' });
  }

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: LoginFixture) => {
      const loginPage = new LoginPage(page, logger);
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
    this.logger.info(`Login Page: waiting for the login form to be ${state}`);
    await Promise.all([
      this.usernameInput.waitFor({ state, timeout }),
      this.passwordInput.waitFor({ state, timeout }),
      this.signInButton.waitFor({ state, timeout })
    ]);
  }

  async isVisible() {
    this.logger.info('Login Page: checking if login form elements are visible');
    const results = await Promise.all([
      this.usernameInput.isVisible(),
      this.passwordInput.isVisible(),
      this.signInButton.isVisible()
    ]);
    return results.every(Boolean);
  }
}
