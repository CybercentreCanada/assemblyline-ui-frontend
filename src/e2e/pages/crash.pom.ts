import type { Locator, Page, TestInfo } from '@playwright/test';
import { BasePage } from 'e2e/pages/base.pom';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs, WaitForOptions } from 'e2e/utils/playwright.models';

type CrashFixture = (r: CrashPage) => Promise<void>;

export class CrashPage extends BasePage {
  private readonly errorFallback: Locator;

  constructor(page: Page, logger: Logger, testInfo: TestInfo) {
    super(page, logger, testInfo, 'Crash Page', '/crash');

    this.errorFallback = page.locator('[data-testid="error-fallback"]');
  }

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: CrashFixture, testInfo: TestInfo) => {
      const crashPage = new CrashPage(page, logger, testInfo);
      await use(crashPage);
    };

  override async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await super.waitFor({ state, timeout });
    await this.errorFallback.waitFor({ state, timeout });
  }

  override async isVisible(): Promise<boolean> {
    await super.isVisible();
    return await this.errorFallback.isVisible();
  }
}
