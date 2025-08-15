import type { Locator, Page, TestInfo } from '@playwright/test';
import type { AlertSeverity } from 'e2e/components/MuiAlert.pom';
import { MuiAlert } from 'e2e/components/MuiAlert.pom';
import { BasePage } from 'e2e/pages/base.pom';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs, WaitForOptions } from 'e2e/utils/playwright.models';

type SubmitFixture = (r: SubmitPage) => Promise<void>;

export class SubmitPage extends BasePage {
  private readonly bannerImage: Locator;
  private readonly bannerAlert: MuiAlert;

  constructor(page: Page, logger: Logger, testInfo: TestInfo) {
    logger.info('[SubmitPage] Constructor called');
    super(page, logger, testInfo, 'Submit Page', '/');
    this.bannerImage = this.page.locator('img[src="/images/banner_dark.svg"]');
    this.bannerAlert = new MuiAlert(this.page.locator('[data-testid="banner"]'), logger, testInfo);
    logger.info('[SubmitPage] Constructor completed');
  }

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: SubmitFixture, testInfo: TestInfo) => {
      logger.info('[SubmitPage.fixture] Creating SubmitPage instance');
      const submitPage = new SubmitPage(page, logger, testInfo);
      await use(submitPage);
      logger.info('[SubmitPage.fixture] Fixture completed');
    };

  async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    this.logger.info(`[SubmitPage.waitFor] Waiting for page and bannerImage. state="${state}", timeout=${timeout}`);
    await super.waitFor({ state, timeout });
    await this.bannerImage.waitFor({ state, timeout });
    this.logger.info('[SubmitPage.waitFor] Wait completed');
  }

  async isVisible() {
    this.logger.info('[SubmitPage.isVisible] Checking visibility');
    const pageVisible = await super.isVisible();
    const bannerVisible = await this.bannerImage.isVisible();
    this.logger.info(`[SubmitPage.isVisible] Page visible=${pageVisible}, Banner visible=${bannerVisible}`);
    return bannerVisible;
  }

  async getBanner({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<{
    level: AlertSeverity;
    textContent: string;
  }> {
    this.logger.info(`[SubmitPage.getBanner] Waiting for banner alert. state="${state}", timeout=${timeout}`);
    await this.bannerAlert.waitFor({ state, timeout });
    const alertData = await this.bannerAlert.getAlertData();
    this.logger.info(`[SubmitPage.getBanner] Banner data: level="${alertData.level}", text="${alertData.textContent}"`);
    return alertData;
  }
}
