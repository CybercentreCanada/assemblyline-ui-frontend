import type { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from 'e2e/pages/base.pom';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs, WaitForOptions } from 'e2e/utils/playwright.models';
import { tryCatch } from 'e2e/utils/playwright.utils';

type NotFoundPageFixture = (r: NotFoundPage) => Promise<void>;

export class PageNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundPageError';
  }
}

export class NotFoundPage extends BasePage {
  readonly deadLinkImage: Locator;
  readonly deadLinkText: Locator;

  constructor(page: Page, logger: Logger, testInfo: TestInfo) {
    super(page, logger, testInfo, 'NotFoundPage', '*');

    this.deadLinkImage = page.locator(`img[src="/images/dead_link.png"]`);
    this.deadLinkText = page.getByText(`Looks like this 'Link' is dead...`, { exact: true });
  }

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: NotFoundPageFixture, testInfo: TestInfo) => {
      const notFoundPage = new NotFoundPage(page, logger, testInfo);
      await use(notFoundPage);
    };

  async waitForAppearance({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<void> {
    await Promise.all([this.deadLinkImage.waitFor({ state, timeout }), this.deadLinkText.waitFor({ state, timeout })]);
  }

  async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<void> {
    await tryCatch(this.waitForAppearance({ state, timeout }));
    const visible = await this.isVisible();
    expect(visible, `Expected NotFound page to be visible at ${this.page.url()}`).toBeTruthy();
  }

  async isVisible(): Promise<boolean> {
    return (await this.deadLinkImage.isVisible()) && (await this.deadLinkText.isVisible());
  }

  isError(error: unknown): error is PageNotFoundError {
    return error instanceof PageNotFoundError;
  }

  async expectNotVisible(): Promise<void> {
    const visible = await this.isVisible();
    this.logger.info(`NotFoundPage visibility check at URL: ${this.page.url()} → ${visible}`);
    expect(visible, `Expected NotFound page NOT to be visible at ${this.page.url()}`).toBeFalsy();
  }

  async expectVisible({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<void> {
    await this.waitForAppearance({ state, timeout });
    const visible = await this.isVisible();
    this.logger.info(`NotFound page visible at URL: ${this.page.url()}`);
    expect(visible, `Expected NotFound page to be visible at ${this.page.url()}`).toBeTruthy();
  }

  async handleIfError(error: Error): Promise<void> {
    if (error) {
      this.logger.error(`Error detected at ${this.page.url()}: ${error}`);
    }
  }
}
