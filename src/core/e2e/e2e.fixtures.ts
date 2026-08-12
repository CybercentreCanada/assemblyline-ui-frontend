/* eslint-disable react-hooks/rules-of-hooks */
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { test as base } from '@playwright/test';
import { RESULTS_DIR } from 'app/spec.constant';
import { SnackbarContext } from 'core/snackbar/snackbar.pom';
import type { ErrorDetectionPages } from 'core/e2e/e2e.fallbacks';
import type { PlaywrightArgs } from 'core/e2e/e2e.models';
import { createErrorDetectionPages } from 'core/e2e/e2e.fallbacks';
import { APIFixture } from 'core/e2e/utils/APIFixture';
import { LoginPage } from 'layout/auth/log-in/log-in.pom';
import path from 'path';
import { DevelopmentLibraryInputsPage } from 'routes/development-library/development-library.pom';
import { WorkflowCreatePage } from 'routes/manage-workflow-create/manage-workflow-create.pom';
import { WorkflowDetailPage } from 'routes/manage-workflow-detail/manage-workflow-detail.pom';
import { WorkflowsPage } from 'routes/manage-workflows/manage-workflows.pom';
import { SubmissionDetailPage } from 'routes/submission-detail/submission-detail.pom';
import { SubmissionReportPage } from 'routes/submission-report/submission-report.pom';
import { SubmitPage } from 'routes/submit/submit.pom';
import { AccountPage } from 'routes/user/user.pom';

type UserSession = ErrorDetectionPages & {
  // Fixture
  api: APIFixture;
  context: BrowserContext;
  page: Page;

  // Context
  snackbarContext: SnackbarContext;

  // Pages
  accountPage: AccountPage;
  developmentLibraryInputs: DevelopmentLibraryInputsPage;
  loginPage: LoginPage;
  submissionDetailPage: SubmissionDetailPage;
  submissionReportPage: SubmissionReportPage;
  submitPage: SubmitPage;
  workflowCreatePage: WorkflowCreatePage;
  workflowDetailPage: WorkflowDetailPage;
  workflowsPage: WorkflowsPage;
};

type SetupBundle = {
  browser: Browser;
  browserName: string;
  user: 'admin' | 'user';
};

async function setupBundle({ browser, browserName, user }: SetupBundle): Promise<UserSession> {
  const context = await browser.newContext({
    storageState: path.join(RESULTS_DIR, `${browserName}-${user}-session.json`)
  });
  const page = await context.newPage();

  return {
    // Fixture
    api: new APIFixture(page),
    context,
    page,

    // Contexts
    snackbarContext: new SnackbarContext(page),

    // Error detection
    ...createErrorDetectionPages(page),

    // Pages
    accountPage: new AccountPage(page),
    developmentLibraryInputs: new DevelopmentLibraryInputsPage(page),
    loginPage: new LoginPage(page),
    submissionDetailPage: new SubmissionDetailPage(page),
    submissionReportPage: new SubmissionReportPage(page),
    submitPage: new SubmitPage(page),
    workflowCreatePage: new WorkflowCreatePage(page),
    workflowDetailPage: new WorkflowDetailPage(page),
    workflowsPage: new WorkflowsPage(page)
  };
}

type Fixtures = {
  adminSession: UserSession;
  userSession: UserSession;
};

export const test = base.extend<Fixtures>({
  adminSession: async ({ browser, browserName }: PlaywrightArgs, use: (r: UserSession) => Promise<void>) => {
    const bundle = await setupBundle({ browser, browserName, user: 'admin' });
    await use(bundle);
    await bundle.context.close();
  },

  userSession: async ({ browser, browserName }: PlaywrightArgs, use: (r: UserSession) => Promise<void>) => {
    const bundle = await setupBundle({ browser, browserName, user: 'user' });
    await use(bundle);
    await bundle.context.close();
  }
});

export { expect } from '@playwright/test';
