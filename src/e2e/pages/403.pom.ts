import type { Locator, Page } from '@playwright/test';
import { expect, test } from 'e2e/configs/playwright.fixtures';
import type { WaitForOptions } from 'e2e/configs/playwright.models';
import { PageObjectModel } from 'e2e/utils/PageObjectModel';

// typ

// type ForbiddenPageFixture = (r: ForbiddenPage) => Promise<void>;

export class PageForbiddenError extends Error {
  visible: boolean;

  constructor(visible: boolean) {
    super(null);
    this.name = 'ForbiddenPageError';
    this.visible = visible;
  }
}

export class ForbiddenPage extends PageObjectModel {
  readonly forbiddenTitle: Locator;
  readonly forbiddenMessage: Locator;

  constructor(page: Page) {
    super(page, 'Forbidden page', '/forbidden');

    this.forbiddenTitle = page.getByText('403: Forbidden', { exact: true });
    this.forbiddenMessage = page.getByText('You are not allowed to view this page...', { exact: true });
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await Promise.all([
      this.forbiddenTitle.waitFor({ state, timeout }),
      this.forbiddenMessage.waitFor({ state, timeout })
    ]);
  }

  async waitForFallback({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<PageForbiddenError> {
    return await test.step(`Waiting for ${this.name} fallback to become ${state}`, async () => {
      try {
        await this.waitForPage({ state, timeout });
        throw new PageForbiddenError(true);
      } catch (err) {
        if (err instanceof PageForbiddenError) {
          return err;
        }
      }
      return new PageForbiddenError(false);
    });
  }

  async expectErrors({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    const { visible } = await this.waitForFallback({ state, timeout });
    expect(visible, `Expected ${this.name} to be visible!`).toBeTruthy();
  }

  async expectNoErrors({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await this.waitForFallback({ state, timeout }).then(({ visible }) => {
      expect(visible, `Unexpected ${this.name} appeared!`).toBeFalsy();
    });
  }

  // async waitForFallback({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<PageForbiddenError> {
  //   return await test.step(`Waiting for ${this.name} fallback to become ${state}`, async () => {
  //     try {
  //       await this.waitForPage({ state, timeout });

  //       throw new PageForbiddenError(true);
  //     } catch (err) {
  //       if (err instanceof PageForbiddenError) {
  //         return err;
  //       }
  //     }
  //     return new PageForbiddenError(false);
  //   });
  // }

  // async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<void> {
  //   await tryCatch(this.waitForAppearance({ state, timeout }));
  //   const visible = await this.isVisible();
  //   expect(visible, `Expected forbidden page to be visible at ${this.page.url()}`).toBeTruthy();
  // }

  // async waitForAppearance({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<void> {
  //   await Promise.all([
  //     this.forbiddenTitle.waitFor({ state, timeout }),
  //     this.forbiddenMessage.waitFor({ state, timeout })
  //   ]);
  // }

  // async isVisible(): Promise<boolean> {
  //   return (await this.forbiddenTitle.isVisible()) && (await this.forbiddenMessage.isVisible());
  // }

  // isError(error: unknown): error is PageForbiddenError {
  //   return error instanceof PageForbiddenError;
  // }

  // async expectNotVisible(): Promise<void> {
  //   const visible = await this.isVisible();
  //   this.logger.info(`ForbiddenPage visibility check at URL: ${this.page.url()} → ${visible}`);
  //   expect(visible, `Expected forbidden page NOT to be visible at ${this.page.url()}`).toBeFalsy();
  // }

  // async expectVisible({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<void> {
  //   await this.waitForAppearance({ state, timeout });
  //   const visible = await this.isVisible();
  //   this.logger.info(`Forbidden page visible at URL: ${this.page.url()}`);
  //   expect(visible, `Expected forbidden page to be visible at ${this.page.url()}`).toBeTruthy();
  // }

  // async handleIfError(error: Error): Promise<void> {
  //   if (error) {
  //     this.logger.error(`Error detected at ${this.page.url()}: ${error}`);
  //   }
  // }
}
