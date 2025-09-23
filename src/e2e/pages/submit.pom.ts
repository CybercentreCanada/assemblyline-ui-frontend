import type { Locator, Page } from '@playwright/test';
import type { WaitForOptions } from 'e2e/shared/models';
import { PageObjectModel } from 'e2e/utils/PageObjectModel';

// type SubmitFixture = (r: SubmitPage) => Promise<void>;

export class SubmitPage extends PageObjectModel {
  private readonly bannerImage: Locator;

  constructor(page: Page) {
    super(page, 'Submit page', '/submit');
    this.bannerImage = this.page.locator('img[src="/images/banner.svg"], img[src="/images/banner_dark.svg"]');
    // this.bannerAlert = new MuiAlert(this.page.locator('[data-testid="banner"]'));
  }

  // static fixture = () => {
  //   return async ({ page }: PlaywrightArgs, use: SubmitFixture) => {
  //     const submitPage = new SubmitPage(page);
  //     await use(submitPage);
  //   };
  // };

  locators(): Locator[] {
    return [this.bannerImage];
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await this.bannerImage.waitFor({ state, timeout });
  }

  // async goto() {
  //   await test.step(`Navigating to the ${this.name}`, async () => {
  //     await this.page.goto(this.route);
  //   });
  // }

  // async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
  //   await test.step(`Waiting for the ${this.name} to be ${state}`, async () => {
  //     await this.bannerImage.waitFor({ state, timeout });
  //   });
  // }

  // async isVisible() {
  //   this.logger.info('[SubmitPage.isVisible] Checking visibility');
  //   const pageVisible = await super.isVisible();
  //   const bannerVisible = await this.bannerImage.isVisible();
  //   this.logger.info(`[SubmitPage.isVisible] Page visible=${pageVisible}, Banner visible=${bannerVisible}`);
  //   return bannerVisible;
  // }

  // async getBanner({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<{
  //   level: AlertSeverity;
  //   textContent: string;
  // }> {
  //   this.logger.info(`[SubmitPage.getBanner] Waiting for banner alert. state="${state}", timeout=${timeout}`);
  //   await this.bannerAlert.waitFor({ state, timeout });
  //   const alertData = await this.bannerAlert.getAlertData();
  //   this.logger.info(`[SubmitPage.getBanner] Banner data: level="${alertData.level}", text="${alertData.textContent}"`);
  //   return alertData;
  // }
}
