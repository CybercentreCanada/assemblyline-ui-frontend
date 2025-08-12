import type { Locator, Page, TestInfo } from '@playwright/test';

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
