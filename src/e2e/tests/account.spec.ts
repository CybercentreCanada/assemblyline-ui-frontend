import type { WhoAmIProps } from 'components/models/ui/user';
import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { test } from 'e2e/shared/fixtures';

test.describe('Account page', () => {
  test('should detect the account page', async ({ userSession }) => {
    let data: WhoAmIProps;

    void userSession.api.waitForResponse<WhoAmIProps>('/user/**', MEDIUM_TIMEOUT).then(({ api_response }) => {
      data = api_response;
    });

    void userSession.crashPage.monitorForNoError();
    void userSession.notFoundPage.monitorForNoError();
    void userSession.forbiddenPage.monitorForNoError();

    await userSession.accountPage.goto();
    await userSession.page.waitForTimeout(MEDIUM_TIMEOUT);
    await userSession.accountPage.expectToBeVisible(undefined, data.email);
  });
});
