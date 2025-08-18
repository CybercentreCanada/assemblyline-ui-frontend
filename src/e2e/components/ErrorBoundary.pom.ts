import type { Locator, Page } from '@playwright/test';
import { expect, test } from 'e2e/configs/playwright.fixtures';
import type { WaitForOptions } from 'e2e/configs/playwright.models';
import { ComponentObjectModel } from 'e2e/utils/ComponentObjectModel';

export class ErrorBoundaryError extends Error {
  constructor(message: string | null, stack: string | null) {
    super(message);
    this.name = 'ErrorBoundaryError';
    this.stack = stack;
  }
}

export class ErrorBoundary extends ComponentObjectModel {
  private readonly errorFallback: Locator;
  private readonly errorMessage: Locator;
  private readonly showStackButton: Locator;
  private readonly errorStack: Locator;

  constructor(readonly page: Page) {
    super(page, 'ErrorBoundary');
    this.errorFallback = page.locator('[data-testid="error-fallback"]');
    this.errorMessage = this.errorFallback.locator('[data-testid="error-message"]');
    this.showStackButton = this.errorFallback.getByRole('button', { name: 'Show Stack' });
    this.errorStack = this.errorFallback.locator('[data-testid="error-stack"]');
  }

  async waitForComponent({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await this.errorFallback.waitFor({ state, timeout });
  }

  async waitForFallback({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<ErrorBoundaryError> {
    return await test.step(`Waiting for ${this.name} fallback to become ${state}`, async () => {
      try {
        await this.errorFallback.waitFor({ state, timeout });

        const message = (await this.errorMessage.textContent())?.trim() || null;

        if (await this.showStackButton.isVisible()) {
          await this.showStackButton.click();
        }

        const stack = (await this.errorStack.textContent())?.trim() || null;
        throw new ErrorBoundaryError(message, stack);
      } catch (err) {
        if (err instanceof ErrorBoundaryError) {
          return err;
        }
      }
      return new ErrorBoundaryError(null, null);
    });
  }

  async expectErrors({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    const { stack } = await this.waitForFallback({ state, timeout });
    expect(stack, `Expected ${this.name} to be visible!`).toBeFalsy();
  }

  async expectNoErrors({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await this.waitForFallback({ state, timeout }).then(({ stack }) => {
      expect(stack, `Unexpected ${this.name} appeared!`).toBeFalsy();
    });
  }

  async captureError({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<ErrorBoundaryError> {
    const { message, stack } = await this.waitForFallback({ state, timeout });
    return new ErrorBoundaryError(message, stack);
  }
}
