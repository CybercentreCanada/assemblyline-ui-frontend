/* eslint-disable react-hooks/rules-of-hooks */
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { test as base } from '@playwright/test';
import { SnackbarContext } from 'e2e/contexts/Snackbar.pom';
import { ForbiddenPage } from 'e2e/pages/403.pom';
import { NotFoundPage } from 'e2e/pages/404_dl.pom';
import { AccountPage } from 'e2e/pages/account.pom';
import { CrashPage } from 'e2e/pages/crash.pom';
import { DevelopmentLibraryInputsPage } from 'e2e/pages/development/development_library_inputs.pom';
import { LoginPage } from 'e2e/pages/login.pom';
import { WorkflowCreatePage } from 'e2e/pages/manage/workflow/workflow_create.pom';
import { WorkflowDetailPage } from 'e2e/pages/manage/workflow/workflow_detail.pom';
import { WorkflowsPage } from 'e2e/pages/manage/workflow/workflows.pom';
import { SubmissionDetailPage } from 'e2e/pages/submission/submission_detail.pom';
import { SubmissionReportPage } from 'e2e/pages/submission/submission_report.pom';
import { SubmitPage } from 'e2e/pages/submit.pom';
import { TermsOfServicePage } from 'e2e/pages/tos.pom';
import { RESULTS_DIR } from 'e2e/shared/constants';
import type { PlaywrightArgs } from 'e2e/shared/models';
import { APIFixture } from 'e2e/utils/APIFixture';
import path from 'path';

type UserSession = {
  // Fixture
  api: APIFixture;
  context: BrowserContext;
  page: Page;

  // Context
  snackbarContext: SnackbarContext;

  // Error detection
  crashPage: CrashPage;
  forbiddenPage: ForbiddenPage;
  notFoundPage: NotFoundPage;
  tosPage: TermsOfServicePage;

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
    crashPage: new CrashPage(page),
    forbiddenPage: new ForbiddenPage(page),
    notFoundPage: new NotFoundPage(page),
    tosPage: new TermsOfServicePage(page),

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
