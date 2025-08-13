import type { Locator, Page } from '@playwright/test';
import { BasePage } from 'e2e/utils/base_page.util';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs, WaitForOptions } from 'e2e/utils/playwright.models';

type CrashFixture = (r: CrashPage) => Promise<void>;

export class CrashPage extends BasePage {
  private readonly errorFallback: Locator;

  constructor(
    protected page: Page,
    protected logger: Logger
  ) {
    super(page, logger, 'Crash Page', '/crash');
    this.errorFallback = page.locator('[data-testid="error-fallback"]');
  }

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: CrashFixture) => {
      const crashPage = new CrashPage(page, logger);
      await use(crashPage);
    };

  async goto() {
    this.logger.info('Crash Page: navigating to route');
    await this.page.goto(this.route);
  }

  async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    this.logger.info(`Crash Page: waiting to be ${state}`);
    await this.errorFallback.waitFor({ state, timeout });
  }

  async isVisible() {
    this.logger.info('Crash Page: checking page has loaded successfully');
    return await this.errorFallback.isVisible();
  }
}
