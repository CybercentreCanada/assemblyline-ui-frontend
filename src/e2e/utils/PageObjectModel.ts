import type { Page } from '@playwright/test';
import { test } from 'e2e/configs/playwright.fixtures';
import type { PlaywrightArgs, WaitForOptions } from 'e2e/configs/playwright.models';

export abstract class PageObjectModel {
  constructor(
    protected readonly page: Page,
    protected readonly name: string = null,
    protected readonly route: string = null
  ) {}

  static fixture<T extends PageObjectModel>(this: new (page: Page) => T) {
    return async ({ page }: PlaywrightArgs, use: (r: T) => Promise<void>) => {
      const instance = new this(page);
      await use(instance);
    };
  }

  async goto() {
    await test.step(`Navigating to the ${this.name}`, async () => {
      await this.page.goto(this.route);
    });
  }

  protected abstract waitForPage(options: WaitForOptions): Promise<void>;

  async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await test.step(`Waiting for the ${this.name} to become ${state}`, async () => {
      await this.waitForPage({ state, timeout });
    });
  }
}
