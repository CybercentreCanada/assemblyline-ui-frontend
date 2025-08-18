import type { Locator, Page } from '@playwright/test';
import { expect, test } from 'e2e/configs/playwright.fixtures';
import type { WaitForOptions } from 'e2e/configs/playwright.models';
import { PageObjectModel } from 'e2e/utils/PageObjectModel';

// type NotFoundPageFixture = (r: NotFoundPage) => Promise<void>;

export class PageNotFoundError extends Error {
  visible: boolean;
  path: string;

  constructor(visible: boolean, path: string = null) {
    super(null);
    this.name = 'NotFoundPageError';
    this.visible = visible;
    this.path = path;
  }
}

export class NotFoundPage extends PageObjectModel {
  readonly deadLinkImage: Locator;
  readonly deadLinkText: Locator;

  constructor(page: Page) {
    super(page, 'Not Found page', '*');

    this.deadLinkImage = page.locator(`img[src="/images/dead_link.png"]`);
    this.deadLinkText = page.getByText(`Looks like this 'Link' is dead...`, { exact: true });
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await Promise.all([this.deadLinkImage.waitFor({ state, timeout }), this.deadLinkText.waitFor({ state, timeout })]);
  }

  async waitForFallback({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<PageNotFoundError> {
    return await test.step(`Waiting for ${this.name} fallback to become ${state}`, async () => {
      try {
        await this.waitForPage({ state, timeout });
        throw new PageNotFoundError(true);
      } catch (err) {
        if (err instanceof PageNotFoundError) {
          return err;
        }
      }
      return new PageNotFoundError(false);
    });
  }

  // async waitForFallback({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<PageNotFoundError> {
  //   return await this.waitForPage({ state, timeout })
  //     .then(() => new PageNotFoundError(true))
  //     .catch(() => new PageNotFoundError(false));
  // }

  async expectErrors({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    const { visible } = await this.waitForFallback({ state, timeout });
    expect(visible, `Expected ${this.name} to be ${state} at ${this.page.url()}`).toBeTruthy();
  }

  async expectNoErrors({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await this.waitForFallback({ state, timeout }).then(({ visible }) => {
      expect(visible, `Unexpected ${this.name} to be ${state} at ${this.page.url()}`).toBeFalsy();
    });
  }

  // async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
  //   await Promise.all([this.deadLinkImage.waitFor({ state, timeout }), this.deadLinkText.waitFor({ state, timeout })]);
  // }

  // static fixture =
  //   () =>
  //   async ({ page, logger }: PlaywrightArgs, use: NotFoundPageFixture, testInfo: TestInfo) => {
  //     const notFoundPage = new NotFoundPage(page, logger, testInfo);
  //     await use(notFoundPage);
  //   };

  // async waitForAppearance({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<void> {
  //   await Promise.all([this.deadLinkImage.waitFor({ state, timeout }), this.deadLinkText.waitFor({ state, timeout })]);
  // }

  // async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<void> {
  //   await tryCatch(this.waitForAppearance({ state, timeout }));
  //   const visible = await this.isVisible();
  //   expect(visible, `Expected NotFound page to be visible at ${this.page.url()}`).toBeTruthy();
  // }

  // async isVisible(): Promise<boolean> {
  //   return (await this.deadLinkImage.isVisible()) && (await this.deadLinkText.isVisible());
  // }

  // isError(error: unknown): error is PageNotFoundError {
  //   return error instanceof PageNotFoundError;
  // }

  // async expectNotVisible(): Promise<void> {
  //   const visible = await this.isVisible();
  //   this.logger.info(`NotFoundPage visibility check at URL: ${this.page.url()} → ${visible}`);
  //   expect(visible, `Expected NotFound page NOT to be visible at ${this.page.url()}`).toBeFalsy();
  // }

  // async expectVisible({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<void> {
  //   await this.waitForAppearance({ state, timeout });
  //   const visible = await this.isVisible();
  //   this.logger.info(`NotFound page visible at URL: ${this.page.url()}`);
  //   expect(visible, `Expected NotFound page to be visible at ${this.page.url()}`).toBeTruthy();
  // }

  // async handleIfError(error: Error): Promise<void> {
  //   if (error) {
  //     this.logger.error(`Error detected at ${this.page.url()}: ${error}`);
  //   }
  // }
}
