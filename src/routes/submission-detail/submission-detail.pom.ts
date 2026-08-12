import type { Locator, Page } from '@playwright/test';

export class SubmissionDetailPage {
  readonly title: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByRole('heading', { name: /Submission Details/i });
  }

  async goto(sid: string) {
    await this.page.goto(`/submission/detail/${sid}`);
  }
}
