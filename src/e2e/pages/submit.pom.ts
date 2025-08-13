import type { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from 'e2e/pages/base.pom';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs, WaitForOptions } from 'e2e/utils/playwright.models';

type SubmitFixture = (r: SubmitPage) => Promise<void>;

export class SubmitPage extends BasePage {
  private readonly bannerImage: Locator;

  constructor(page: Page, logger: Logger, testInfo: TestInfo) {
    super(page, logger, testInfo, 'Submit Page', '/');

    this.bannerImage = this.page.locator('img[src="/images/banner_dark.svg"]');
  }

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: SubmitFixture, testInfo: TestInfo) => {
      const submitPage = new SubmitPage(page, logger, testInfo);
      await use(submitPage);
    };

  async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await super.waitFor({ state, timeout });
    await this.bannerImage.waitFor({ state, timeout });
  }

  async isVisible() {
    await super.isVisible();
    return await this.bannerImage.isVisible();
  }
}
