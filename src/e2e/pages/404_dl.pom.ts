import type { Locator, Page } from '@playwright/test';
import { expect, test } from 'e2e/shared/fixtures';
import type { WaitForOptions } from 'e2e/shared/models';
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
