import type { Locator, Page } from '@playwright/test';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { WaitForOptions } from 'e2e/utils/playwright.models';

export abstract class BasePage {
  constructor(
    protected readonly page: Page,
    protected readonly logger: Logger,
    protected readonly name: string,
    protected readonly route: string
  ) {
    this.logger.info(`${this.name}: Initializing`);
  }

  async goto() {
    this.logger.info(`${this.name}: navigating to "${this.route}"`);
    await this.page.goto(this.route);
  }

  async waitForLocator(locator: Locator, { state = 'visible', timeout = 20_000 }: WaitForOptions = {}) {
    this.logger.info(`${this.name}: waiting for locator to be ${state}...`);
    await locator.waitFor({ state, timeout });
  }

  async isVisible(locator: Locator): Promise<boolean> {
    const visible = await locator.isVisible();
    this.logger.info(`${this.name}: locator visibility = ${visible}`);
    return visible;
  }

  async click(locator: Locator) {
    this.logger.info(`${this.name}: clicking on element`);
    await locator.click();
  }

  async fill(locator: Locator, value: string) {
    this.logger.info(`${this.name}: filling with text "${value}"`);
    await locator.fill(value);
  }
}
