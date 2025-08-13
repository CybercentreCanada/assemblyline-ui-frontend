import type { Locator, Page, TestInfo } from '@playwright/test';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs } from 'e2e/utils/playwright.models';
import { tryCatch } from 'e2e/utils/playwright.utils';

type ForbiddenPageFixture = (r: ForbiddenPage) => Promise<void>;

export class PageForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenPageError';
  }
}

export class ForbiddenPage {
  readonly forbiddenTitle: Locator;
  readonly forbiddenMessage: Locator;

  constructor(
    private page: Page,
    private logger: Logger,
    private testInfo: TestInfo
  ) {
    this.forbiddenTitle = page.getByText('403: Forbidden', { exact: true });
    this.forbiddenMessage = page.getByText('You are not allowed to view this page...', { exact: true });
  }

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: ForbiddenPageFixture, testInfo: TestInfo) => {
      const forbiddenPage = new ForbiddenPage(page, logger, testInfo);
      await use(forbiddenPage);
    };

  async waitForAppearance(timeout = 0): Promise<void> {
    await Promise.all([
      this.forbiddenTitle.waitFor({ state: 'visible', timeout }),
      this.forbiddenMessage.waitFor({ state: 'visible', timeout })
    ]);
  }

  async isVisible(): Promise<boolean> {
    return (await this.forbiddenTitle.isVisible()) && (await this.forbiddenMessage.isVisible());
  }

  async throwIfVisible(logger?: Logger): Promise<void> {
    if (await this.isVisible()) {
      const url = this.page.url();
      logger?.error?.(`ForbiddenPage is visible at URL: ${url}`);
      throw new PageForbiddenError(`Forbidden page: ${url}`);
    }
  }

  isError(error: unknown): error is PageForbiddenError {
    return error instanceof PageForbiddenError;
  }

  async waitFor(timeout = 0): Promise<void> {
    await tryCatch(this.waitForAppearance(timeout));
    const url = this.page.url();
    throw new PageForbiddenError(`Forbidden page: ${url}`);
  }

  async handleIfError(error: unknown): Promise<void> {
    if (this.isError(error)) {
      this.logger.error(`Forbidden page: ${this.page.url()}`);
    }
  }
}
