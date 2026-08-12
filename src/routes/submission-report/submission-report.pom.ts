import type { Locator, Page } from '@playwright/test';

export class SubmissionReportPage {
  readonly title: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByRole('heading', { name: /Submission Report/i });
  }

  async goto(sid: string) {
    await this.page.goto(`/submission/report/${sid}`);
  }
}
