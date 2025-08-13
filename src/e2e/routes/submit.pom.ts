import type { Locator, Page } from '@playwright/test';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs, WaitForOptions } from 'e2e/utils/playwright.models';

type SubmitFixture = (r: SubmitPage) => Promise<void>;

export class SubmitPage {
  private readonly route: string = '/';
  private readonly bannerImage: Locator;

  constructor(
    private page: Page,
    private logger: Logger
  ) {
    this.logger.info('Submit Page: Initializing locators');
    this.bannerImage = this.page.locator('img[src="/images/banner_dark.svg"]');
  }

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: SubmitFixture) => {
      const submitPage = new SubmitPage(page, logger);
      await use(submitPage);
    };

  async goto() {
    this.logger.info('Submit Page: navigating to route');
    await this.page.goto(this.route);
  }

  async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    this.logger.info(`Submit Page: waiting to be ${state}`);
    await this.bannerImage.waitFor({ state, timeout });
  }

  async isVisible() {
    this.logger.info('Submit Page: checking page has loaded successfully');
    return await this.bannerImage.isVisible();
  }
}
