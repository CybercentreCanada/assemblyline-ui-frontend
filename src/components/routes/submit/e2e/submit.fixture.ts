/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import { SubmitPage } from 'components/routes/submit/e2e/submit.pom';

type Fixtures = {
  submitPage: SubmitPage;
};

export const test = base.extend<Fixtures>({
  submitPage: async ({ page }, use) => {
    await use(new SubmitPage(page));
  }
});

export { expect } from '@playwright/test';
