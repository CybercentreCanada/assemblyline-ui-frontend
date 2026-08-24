import type { Locator, Page } from '@playwright/test';
import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { expect, test } from 'e2e/shared/fixtures';
import type { WaitForOptions } from 'e2e/shared/models';

type SnackbarVariant = 'success' | 'error' | 'warning' | 'info';

export class SnackbarContext {
  readonly container: Locator;
  readonly snackbars: Locator;
  readonly lastSnackbar: Locator;

  constructor(private readonly page: Page) {
    this.container = page.locator('div[role="presentation"]');
    this.snackbars = this.container.locator('[role="alert"]');
    this.lastSnackbar = this.snackbars.last();
  }

  locators(): Locator[] {
    return [this.container];
  }

  async waitFor(options: WaitForOptions) {
    await this.container.waitFor({ state: 'visible', timeout: MEDIUM_TIMEOUT, ...options });
  }

  async expect(variant: SnackbarVariant, message: string | RegExp, options?: { timeout?: number; visible?: boolean }) {
    await test.step(`Expect ${variant} snackbar with message: "${message}"`, async () => {
      await expect(this.page.locator(`.notistack-MuiContent-${variant}`).filter({ hasText: message })).toBeVisible({
        visible: true,
        timeout: MEDIUM_TIMEOUT,
        ...options
      });
    });
  }

  async expectLastMessage(message: string | RegExp, { timeout = MEDIUM_TIMEOUT }: { timeout?: number } = {}) {
    await test.step(`Expect last snackbar message: "${message}"`, async () => {
      await expect(this.lastSnackbar).toHaveText(message, { timeout });
    });
  }

  async expectLastType(variant: SnackbarVariant, { timeout = MEDIUM_TIMEOUT }: { timeout?: number } = {}) {
    await test.step(`Expect last snackbar to be of type "${variant}"`, async () => {
      const variantClass = `.notistack-MuiContent-${variant}`;
      await expect(this.lastSnackbar.locator(variantClass)).toBeVisible({ timeout });
    });
  }

  async dismissLast({ timeout = MEDIUM_TIMEOUT }: { timeout?: number } = {}) {
    await test.step('Dismissing last snackbar', async () => {
      const closeButton = this.lastSnackbar.locator('button[aria-label="Close"]');
      if (await closeButton.isVisible({ timeout })) {
        await closeButton.click();
      }
    });
  }

  async monitorForNoError({ timeout = MEDIUM_TIMEOUT }: WaitForOptions = {}) {
    return await test.step(`Expecting no error snackbar to appear`, async () => {
      const errorSnackbar = this.page.locator('.notistack-MuiContent-error');
      const isVisible = await errorSnackbar.isVisible({ timeout });
      expect(isVisible, `Unexpected error snackbar appeared at ${this.page.url()}`).toBeFalsy();
    });
  }
}
