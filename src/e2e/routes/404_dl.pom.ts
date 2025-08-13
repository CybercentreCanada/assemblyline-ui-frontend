import type { Locator, Page, TestInfo } from '@playwright/test';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs } from 'e2e/utils/playwright.models';
import { tryCatch } from 'e2e/utils/playwright.utils';

type NotFoundPageFixture = (r: NotFoundPage) => Promise<void>;

export class PageNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundPageError';
  }
}

export class NotFoundPage {
  readonly deadLinkImage: Locator;
  readonly deadLinkText: Locator;

  constructor(
    private page: Page,
    private logger: Logger,
    private testInfo: TestInfo
  ) {
    this.deadLinkImage = page.locator('img[src="/images/dead_link.png"]');
    this.deadLinkText = page.getByText(`Looks like this 'Link' is dead...`);
  }

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: NotFoundPageFixture, testInfo: TestInfo) => {
      const notFoundPage = new NotFoundPage(page, logger, testInfo);
      await use(notFoundPage);
    };

  async waitForAppearance(timeout = 0): Promise<void> {
    await Promise.all([
      this.deadLinkImage.waitFor({ state: 'visible', timeout }),
      this.deadLinkText.waitFor({ state: 'visible', timeout })
    ]);
  }

  async isVisible(): Promise<boolean> {
    return (await this.deadLinkImage.isVisible()) && (await this.deadLinkText.isVisible());
  }

  async throwIfVisible(logger?: Logger): Promise<void> {
    if (await this.isVisible()) {
      const url = this.page.url();
      logger.error(`NotFoundPage is visible at URL: ${url}`);
      throw new PageNotFoundError(`Dead link: ${url}`);
    }
  }

  isError(error: unknown): error is PageNotFoundError {
    return error instanceof PageNotFoundError;
  }

  async waitFor(timeout = 0): Promise<void> {
    await tryCatch(this.waitForAppearance(timeout));
    const url = this.page.url();
    throw new PageNotFoundError(`Dead link: ${url}`);
  }

  async handleIfError(error: unknown): Promise<void> {
    if (this.isError(error)) {
      this.logger.error(`Dead link: ${this.page.url()}`);
    }
  }
}
