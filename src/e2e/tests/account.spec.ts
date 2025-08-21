import type { WhoAmIProps } from 'components/models/ui/user';
import { MEDIUM_TIMEOUT } from 'e2e/shared/constants';
import { test } from 'e2e/shared/fixtures';

test.describe('Account page', () => {
  test('should detect the account page', async ({ userUI }) => {
    let data: WhoAmIProps;

    void userUI.api.waitForResponse<WhoAmIProps>('/user/**', MEDIUM_TIMEOUT).then(({ api_response }) => {
      data = api_response;
    });

    void userUI.crashPage.monitorForNoError();
    void userUI.notFoundPage.monitorForNoError();
    void userUI.forbiddenPage.monitorForNoError();

    await userUI.accountPage.goto();
    await userUI.page.waitForTimeout(MEDIUM_TIMEOUT);
    await userUI.accountPage.expectToBeVisible(undefined, data.email);
  });
});
