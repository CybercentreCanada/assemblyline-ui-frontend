import { MEDIUM_TIMEOUT } from 'app/core.spec';
import { test } from 'core/spec/shared/fixtures';
import type { WhoAmIProps } from 'models/api/user';

test.describe('Account page', () => {
  test('should detect the account page', async ({ userSession }) => {
    let data: WhoAmIProps;

    void userSession.api.waitForResponse<WhoAmIProps>('/user/**').then(({ api_response }) => {
      data = api_response;
    });

    void userSession.crashPage.monitorForNoError();
    void userSession.notFoundPage.monitorForNoError();
    void userSession.forbiddenPage.monitorForNoError();
    void userSession.snackbarContext.monitorForNoError();

    await userSession.accountPage.goto();
    await userSession.page.waitForTimeout(MEDIUM_TIMEOUT);
    await userSession.accountPage.expectToBeVisible(undefined, data.name);
  });
});
