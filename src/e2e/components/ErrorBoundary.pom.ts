import type { Locator, Page, TestInfo } from '@playwright/test';
import { expect } from '@playwright/test';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs } from 'e2e/utils/playwright.models';

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
    this.logger.info('ErrorBoundary: Initializing locators');
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
    return this.errorFallback.isVisible();
  }

  async getErrorMessage(): Promise<string | null> {
    if (!(await this.isVisible())) return null;
    const text = await this.errorMessage.textContent();
    return text?.trim() || null;
  }

  async getErrorStack(): Promise<string | null> {
    if (!(await this.isVisible())) return null;
    await this.showStackButton.click();
    return this.errorStack.textContent();
  }

  isError(error: unknown): error is ErrorBoundaryError {
    return error instanceof ErrorBoundaryError;
  }

  async waitFor(timeout = 0): Promise<void> {
    await this.errorFallback.waitFor({ state: 'visible', timeout });
    const message = (await this.getErrorMessage()) ?? 'Unknown error boundary message';
    throw new ErrorBoundaryError(message);
  }

  async expectVisible(): Promise<void> {
    await expect(this.errorFallback).toBeVisible();
    const stack = await this.getErrorStack();
    this.logger.success(`ErrorBoundary visible at URL: ${this.page.url()}`);
    expect(stack).toBeTruthy();
  }

  async expectNotVisible(): Promise<void> {
    await expect(this.errorFallback).not.toBeVisible();
  }
}
