import type {
  Locator,
  Page,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  TestInfo
} from '@playwright/test';
import { test as base } from '@playwright/test';
import { Logger } from 'tests/playwright.logger';
import { BROWSERS } from '../../../playwright.config';

class PlainMessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = '';
  }
}

export class ErrorFallback {
  private readonly main: Locator;
  private readonly showStackButton: Locator;
  private readonly errorMessage: Locator;
  private readonly errorStack: Locator;

  private readonly testInfo: TestInfo;

  constructor(page: Page, testInfo: TestInfo) {
    this.testInfo = testInfo;
    this.main = page.locator('[data-testid="error-fallback"]');
    this.errorMessage = this.main.locator('[data-testid="error-message"]');
    this.showStackButton = this.main.getByRole('button', { name: 'Show Stack' });
    this.errorStack = this.main.locator('[data-testid="error-stack"]');
  }

  async isVisible(): Promise<boolean> {
    return await this.main.isVisible();
  }

  async getErrorMessage(): Promise<string | null> {
    if (!(await this.isVisible())) return null;
    // Capture error text from <pre>, or fallback to container text
    const text = await this.errorMessage.textContent();
    return text?.trim() || null;
  }

  async runWithCheck<T>(testStep: () => Promise<T>): Promise<T> {
    const errorFallbackPromise = this.main.waitFor({ state: 'visible' }).then(async () => {
      await this.showStackButton.click();
      const message = await this.errorStack.textContent();

      // Take screenshot for HTML report
      const screenshotBuffer = await this.main.page().screenshot();
      await this.testInfo.attach('ErrorFallback screenshot', {
        body: screenshotBuffer,
        contentType: 'image/png'
      });

      throw new PlainMessageError(message);
    });

    const testStepPromise = testStep();
    return Promise.race([testStepPromise, errorFallbackPromise]);
  }
}

type Fixtures = PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions;

export const testWithErrorFallback = (title: string, fn: (fixtures: Fixtures, testInfo: TestInfo) => Promise<void>) =>
  base(title, async ({ browserName, browser, context, page }: Fixtures, testInfo: TestInfo) => {
    const browserConfig = BROWSERS.find(b => b.name === browserName);
    if (!browserConfig) throw new Error(`No browser config found for browserName: ${browserName}`);
    const logger = new Logger(browserConfig, testInfo.titlePath);

    try {
      const errorFallback = new ErrorFallback(page, testInfo);
      await errorFallback.runWithCheck(async () => {
        await fn({ browserName, browser, context, page } as Fixtures, testInfo);
      });
    } catch (error) {
      logger.error(`Error during test - ${error}`);
      throw error;
    } finally {
      logger.info('Closing browser...');
      await browser.close();
    }
  });
