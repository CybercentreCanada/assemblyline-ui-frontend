import type { Locator, Page } from '@playwright/test';
import { expect, test } from 'core/e2e/e2e.fixtures';
import type { WaitForOptions } from 'core/e2e/e2e.models';
import { PageObjectModel } from 'core/e2e/utils/PageObjectModel';

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
  readonly deadLinkTitle: Locator;
  readonly deadLinkDescription: Locator;

  constructor(page: Page) {
    super(page, 'Not Found page', '*');

    this.deadLinkTitle = page.getByText('This page took a wrong turn');
    this.deadLinkDescription = page.getByText(
      /The route you requested could not be found. Share the navigation details below with the system administrators if this is unexpected./
    );
  }

  locators(): Locator[] {
    return [this.deadLinkTitle, this.deadLinkDescription];
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await Promise.all([
      this.deadLinkTitle.waitFor({ state, timeout }),
      this.deadLinkDescription.waitFor({ state, timeout })
    ]);
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

  async monitorForError({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    return await test.step(`Expecting the ${this.name} to be ${state}`, async () => {
      const { visible } = await this.waitForFallback({ state, timeout });
      expect(visible, `Expected ${this.name} to be ${state} at ${this.page.url()}`).toBeTruthy();
    });
  }

  async monitorForNoError({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    return await test.step(`Expecting the ${this.name} to not be ${state}`, async () => {
      await this.waitForFallback({ state, timeout }).then(({ visible }) => {
        expect(visible, `Unexpected ${this.name} to be ${state} at ${this.page.url()}`).toBeFalsy();
      });
    });
  }
}
