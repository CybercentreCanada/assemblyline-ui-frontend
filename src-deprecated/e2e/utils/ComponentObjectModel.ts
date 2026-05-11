import type { Page } from '@playwright/test';
import { test } from 'e2e/shared/fixtures';
import type { PlaywrightArgs, WaitForOptions } from 'e2e/shared/models';

export abstract class ComponentObjectModel {
  constructor(
    protected readonly page: Page,
    protected readonly name: string = null
  ) {}

  static fixture<T extends ComponentObjectModel>(this: new (page: Page) => T) {
    return async ({ page }: PlaywrightArgs, use: (r: T) => Promise<void>) => {
      const instance = new this(page);
      await use(instance);
    };
  }
  protected abstract waitForComponent(options: WaitForOptions): Promise<void>;

  async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await test.step(`Waiting for the ${this.name} to become ${state}`, async () => {
      await this.waitForComponent({ state, timeout });
    });
  }
}
