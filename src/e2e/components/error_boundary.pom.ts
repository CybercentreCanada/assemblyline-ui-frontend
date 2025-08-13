import type { Locator, Page, TestInfo } from '@playwright/test';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs } from 'e2e/utils/playwright.models';
import { tryCatch } from 'e2e/utils/playwright.utils';

type ErrorBoundaryFixture = (r: ErrorBoundary) => Promise<void>;

export class ErrorBoundaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorBoundaryError';
  }
}

export class ErrorBoundary {
  private readonly errorFallback: Locator;
  private readonly showStackButton: Locator;
  private readonly errorMessage: Locator;
  private readonly errorStack: Locator;

  constructor(
    private page: Page,
    private logger: Logger,
    private testInfo: TestInfo
  ) {
    this.logger.info('Submit Page: Initializing locators');
    this.errorFallback = page.locator('[data-testid="error-fallback"]');
    this.errorMessage = this.errorFallback.locator('[data-testid="error-message"]');
    this.showStackButton = this.errorFallback.getByRole('button', { name: 'Show Stack' });
    this.errorStack = this.errorFallback.locator('[data-testid="error-stack"]');
  }

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: ErrorBoundaryFixture, testInfo: TestInfo) => {
      const errorBoundary = new ErrorBoundary(page, logger, testInfo);
      await use(errorBoundary);
    };

  async isVisible(): Promise<boolean> {
    return await this.errorFallback.isVisible();
  }

  isError(error: Error) {
    return error instanceof ErrorBoundaryError;
  }

  async failIfVisible(timeout = 0): Promise<void> {
    await tryCatch(this.errorFallback.waitFor({ state: 'visible', timeout }));
    const error = await this.errorMessage.textContent();
    throw new ErrorBoundaryError(error);
  }

  async getErrorMessage(): Promise<string | null> {
    if (!(await this.isVisible())) return null;
    const text = await this.errorMessage.textContent();
    return text?.trim() || null;
  }

  async getErrorStack(): Promise<string | null> {
    if (!(await this.isVisible())) return null;
    await this.showStackButton.click();
    return await this.errorStack.textContent();
  }
}
