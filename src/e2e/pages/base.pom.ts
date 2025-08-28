import type { Page, TestInfo } from '@playwright/test';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { WaitForOptions } from 'e2e/utils/playwright.models';

export abstract class BasePage {
  constructor(
    protected readonly page: Page,
    protected readonly logger: Logger,
    protected readonly testInfo: TestInfo,
    protected readonly name: string,
    protected readonly route: string
  ) {
    this.logger.info(`${this.name}: Initializing`);
  }

  async goto() {
    this.logger.info(`${this.name}: navigating to "${this.route}"`);
    await this.page.goto(this.route);
  }

  async waitFor({ state = 'visible' }: WaitForOptions = {}): Promise<void> {
    this.logger.info(`${this.name}: waiting to be "${state}"`);
  }

  async isVisible(): Promise<boolean> {
    this.logger.info(`${this.name}: checking page has loaded successfully"`);
    return true;
  }
}
