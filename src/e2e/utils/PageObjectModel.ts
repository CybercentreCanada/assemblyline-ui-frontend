import type { Locator, Page } from '@playwright/test';
import { LONG_TIMEOUT, MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { expect, test } from 'e2e/shared/fixtures';
import type { PlaywrightArgs, WaitForOptions } from 'e2e/shared/models';

export abstract class PageObjectModel {
  constructor(
    protected page: Page,
    protected readonly name: string = null,
    protected readonly route: string = null
  ) {}

  static fixture<T extends PageObjectModel>(this: new (page: Page) => T) {
    return async ({ page }: PlaywrightArgs, use: (r: T) => Promise<void>) => {
      const instance = new this(page);
      await use(instance);
    };
  }

  protected abstract locators(): Locator[];

  async usePage(page: Page) {
    this.page = page;
    return this;
  }

  async goto() {
    await test.step(`Navigating to the ${this.name}`, async () => {
      await this.page.goto(this.route, { timeout: LONG_TIMEOUT });
    });
  }

  protected abstract waitForPage(options: WaitForOptions): Promise<void>;

  async waitFor({ state = 'visible', timeout = LONG_TIMEOUT }: WaitForOptions = {}) {
    await test.step(`Waiting for the ${this.name} to become ${state}`, async () => {
      await this.waitForPage({ state, timeout });
    });
  }

  async isVisible({ state = 'visible', timeout = MEDIUM_TIMEOUT }: WaitForOptions = {}): Promise<boolean> {
    try {
      await this.waitForPage({ state, timeout });
      return true;
    } catch {
      return false;
    }
  }

  async expectToBeVisible({ timeout = MEDIUM_TIMEOUT }: WaitForOptions = {}) {
    await test.step(`Expect the ${this.name} to become visible`, async () => {
      await Promise.all(this.locators().map(locator => expect(locator).toBeVisible({ timeout })));
    });
  }
}
