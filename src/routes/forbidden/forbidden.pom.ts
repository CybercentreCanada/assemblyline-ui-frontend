import type { Locator, Page } from '@playwright/test';
import { expect, test } from 'core/e2e/e2e.fixtures';
import type { WaitForOptions } from 'core/e2e/e2e.models';
import { PageObjectModel } from 'core/e2e/utils/PageObjectModel';

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

    this.forbiddenTitle = page.getByRole('heading', { name: 'Nice try, this door is locked' });
    this.forbiddenMessage = page.getByRole('heading', { name: /You are not allowed to view this page/ });
  }

  locators(): Locator[] {
    return [this.forbiddenTitle, this.forbiddenMessage];
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
