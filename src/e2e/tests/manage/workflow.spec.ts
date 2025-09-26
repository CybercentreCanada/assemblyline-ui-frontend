import { test } from 'e2e/shared/fixtures';

test.describe.skip('Workflows page', () => {
  test('should detect the Workflows page', async ({ adminSession }) => {
    void adminSession.crashPage.monitorForNoError();
    void adminSession.notFoundPage.monitorForNoError();
    void adminSession.forbiddenPage.monitorForNoError();
    void adminSession.snackbarContext.monitorForNoError();

    await adminSession.workflowsPage.goto();
    await adminSession.workflowsPage.expectToBeVisible();
  });

  test('should check that the create workflow button is only enabled when the name and query values are valid', async ({
    adminSession
  }) => {
    void adminSession.crashPage.monitorForNoError();
    void adminSession.notFoundPage.monitorForNoError();
    void adminSession.forbiddenPage.monitorForNoError();
    void adminSession.snackbarContext.monitorForNoError();

    await adminSession.workflowCreatePage.goto();
    await adminSession.workflowCreatePage.expectToBeVisible();

    // Initially the button should be disabled
    await adminSession.workflowCreatePage.expectCreateWorkflowButtonToBeDisabled(true);

    // Enter only the name, button should still be disabled
    await adminSession.workflowCreatePage.inputName('Playwright test workflow');
    await adminSession.workflowCreatePage.expectCreateWorkflowButtonToBeDisabled(true);

    // Enter only the query (together with the name now), button should be enabled
    await adminSession.workflowCreatePage.inputQuery('NOT(*)');
    await adminSession.workflowCreatePage.expectCreateWorkflowButtonToBeDisabled(false);

    // Clear the name, button should become disabled again
    await adminSession.workflowCreatePage.inputName('');
    await adminSession.workflowCreatePage.expectCreateWorkflowButtonToBeDisabled(true);

    // Fill both name and query, button should be enabled
    await adminSession.workflowCreatePage.inputName('Playwright test workflow');
    await adminSession.workflowCreatePage.inputQuery('NOT(*)');
    await adminSession.workflowCreatePage.expectCreateWorkflowButtonToBeDisabled(false);
  });

  test('should create a new workflow and delete it after', async ({ adminSession }) => {
    void adminSession.crashPage.monitorForNoError();
    void adminSession.notFoundPage.monitorForNoError();
    void adminSession.forbiddenPage.monitorForNoError();
    void adminSession.snackbarContext.monitorForNoError();

    await adminSession.workflowsPage.goto();
    await adminSession.workflowsPage.clickCreateWorkflowButton();

    await adminSession.workflowCreatePage.expectToBeVisible();

    await adminSession.workflowCreatePage.inputName(`Playwright test - ${new Date(Date.now()).toISOString()}`);
    await adminSession.workflowCreatePage.inputQuery('NOT(*)');
    await adminSession.workflowCreatePage.inputLabels(['ATTRIBUTED', 'CRIME']);
    await adminSession.workflowCreatePage.inputPriority('LOW');
    await adminSession.workflowCreatePage.inputStatus('NON-MALICIOUS');
    await adminSession.workflowCreatePage.inputApplyToAllWorkflows(true);

    await adminSession.workflowCreatePage.expectCreateWorkflowButtonToBeDisabled(false);
    await adminSession.workflowCreatePage.clickCreateWorkflowButton();

    await adminSession.workflowDetailPage.expectToBeVisible();
    await adminSession.snackbarContext.expect('success', /Successfully added the new workflow./i);

    await adminSession.workflowDetailPage.removeWorkflow();
    await adminSession.snackbarContext.expect('success', /Workflow was successfully deleted./i);
  });
});
