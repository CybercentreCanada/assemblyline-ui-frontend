import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  private readonly usernameInput: Locator;

  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async waitForDashboard() {
    await this.page.locator('img[src="/images/banner_dark.svg"]').waitFor();
  }
}
