import type { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from 'e2e/pages/base.pom';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs, WaitForOptions } from 'e2e/utils/playwright.models';
import { tryCatch } from 'e2e/utils/playwright.utils';

type ForbiddenPageFixture = (r: ForbiddenPage) => Promise<void>;

export class PageForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenPageError';
  }
}

export class ForbiddenPage extends BasePage {
  readonly forbiddenTitle: Locator;
  readonly forbiddenMessage: Locator;

  constructor(page: Page, logger: Logger, testInfo: TestInfo) {
    super(page, logger, testInfo, 'Forbidden Page', '/forbidden');

    this.forbiddenTitle = page.getByText('403: Forbidden', { exact: true });
    this.forbiddenMessage = page.getByText('You are not allowed to view this page...', { exact: true });
  }

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: ForbiddenPageFixture, testInfo: TestInfo) => {
      const forbiddenPage = new ForbiddenPage(page, logger, testInfo);
      await use(forbiddenPage);
    };

  async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<void> {
    await tryCatch(this.waitForAppearance({ state, timeout }));
    const visible = await this.isVisible();
    expect(visible, `Expected forbidden page to be visible at ${this.page.url()}`).toBeTruthy();
  }

  async waitForAppearance({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<void> {
    await Promise.all([
      this.forbiddenTitle.waitFor({ state, timeout }),
      this.forbiddenMessage.waitFor({ state, timeout })
    ]);
  }

  async isVisible(): Promise<boolean> {
    return (await this.forbiddenTitle.isVisible()) && (await this.forbiddenMessage.isVisible());
  }

  isError(error: unknown): error is PageForbiddenError {
    return error instanceof PageForbiddenError;
  }

  async expectNotVisible(): Promise<void> {
    const visible = await this.isVisible();
    this.logger.info(`ForbiddenPage visibility check at URL: ${this.page.url()} → ${visible}`);
    expect(visible, `Expected forbidden page NOT to be visible at ${this.page.url()}`).toBeFalsy();
  }

  async expectVisible({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<void> {
    await this.waitForAppearance({ state, timeout });
    const visible = await this.isVisible();
    this.logger.info(`Forbidden page visible at URL: ${this.page.url()}`);
    expect(visible, `Expected forbidden page to be visible at ${this.page.url()}`).toBeTruthy();
  }

  async handleIfError(error: Error): Promise<void> {
    if (error) {
      this.logger.error(`Error detected at ${this.page.url()}: ${error}`);
    }
  }
}
