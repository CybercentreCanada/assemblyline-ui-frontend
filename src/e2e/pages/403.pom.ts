import type { Locator, Page } from '@playwright/test';
import { expect, test } from 'e2e/configs/playwright.fixtures';
import type { WaitForOptions } from 'e2e/configs/playwright.models';
import { PageObjectModel } from 'e2e/utils/PageObjectModel';

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

  async monitorForError({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    return await test.step(`Expecting the ${this.name} to be ${state}`, async () => {
      const { visible } = await this.waitForFallback({ state, timeout });
      expect(visible, `Expected ${this.name} to be visible!`).toBeTruthy();
    });
  }

  async monitorForNoError({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    return await test.step(`Expecting the ${this.name} to not be ${state}`, async () => {
      await this.waitForFallback({ state, timeout }).then(({ visible }) => {
        expect(visible, `Unexpected ${this.name} appeared!`).toBeFalsy();
      });
    });
  }
}
