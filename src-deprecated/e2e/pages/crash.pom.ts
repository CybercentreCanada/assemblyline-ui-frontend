import type { Locator, Page } from '@playwright/test';
import { SHORT_TIMEOUT } from 'e2e/shared/constants';
import { expect, test } from 'e2e/shared/fixtures';
import type { WaitForOptions } from 'e2e/shared/models';
import { PageObjectModel } from 'e2e/utils/PageObjectModel';

export class CrashError extends Error {
  constructor(message: string | null, stack: string | null) {
    super(message);
    this.name = 'CrashError';
    this.stack = stack;
  }
}

export class CrashPage extends PageObjectModel {
  private readonly errorFallback: Locator;
  private readonly errorMessage: Locator;
  private readonly showStackButton: Locator;
  private readonly errorStack: Locator;

  constructor(page: Page) {
    super(page, 'Crash page', '/crash');
    this.errorFallback = page.locator('[data-testid="error-fallback"]');
    this.errorMessage = this.errorFallback.locator('[data-testid="error-message"]');
    this.showStackButton = this.errorFallback.getByRole('button', { name: 'Show Stack' });
    this.errorStack = this.errorFallback.locator('[data-testid="error-stack"]');
  }

  locators(): Locator[] {
    return [this.errorFallback, this.errorMessage];
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await this.errorFallback.waitFor({ state, timeout });
  }

  async waitForFallback({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<CrashError> {
    return await test.step(`Waiting for ${this.name} fallback to become ${state}`, async () => {
      try {
        await this.errorFallback.waitFor({ state, timeout });
        await this.errorMessage.waitFor({ state, timeout: SHORT_TIMEOUT });

        const message = (await this.errorMessage.textContent())?.trim() || null;

        if (await this.showStackButton.isVisible()) {
          await this.showStackButton.click();
        }

        await this.errorStack.waitFor({ state, timeout: SHORT_TIMEOUT });
        const stack = (await this.errorStack.textContent())?.trim() || null;
        throw new CrashError(message, stack);
      } catch (err) {
        if (err instanceof CrashError) {
          return err;
        }
      }
      return new CrashError(null, null);
    });
  }

  async monitorForError({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    return await test.step(`Expecting the ${this.name} fallback to be ${state}`, async () => {
      const { stack } = await this.waitForFallback({ state, timeout });
      expect(stack, `Expected ${this.name} to be visible!`).toBeFalsy();
    });
  }

  async monitorForNoError({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    return await test.step(`Expecting the ${this.name} fallback to not be ${state}`, async () => {
      await this.waitForFallback({ state, timeout }).then(({ stack }) => {
        expect(stack, `Unexpected ${this.name} appeared!`).toBeFalsy();
      });
    });
  }

  async captureError({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<CrashError> {
    const { message, stack } = await this.waitForFallback({ state, timeout });
    return new CrashError(message, stack);
  }
}
