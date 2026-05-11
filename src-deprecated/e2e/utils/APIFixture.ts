import type { Page } from '@playwright/test';
import type { APIResponse } from 'components/core/Query/components/api.models';
import { test } from 'e2e/shared/fixtures';

type Response<T> = {
  url: string;
  status: number;
  body: APIResponse<T>;
  error: unknown;
};

export class APIFixture {
  constructor(
    private readonly page: Page,
    private readonly testInfo = test.info()
  ) {}

  async waitForResponse<T = unknown>(route: string | RegExp, timeout: number = 0) {
    return await test.step(`Waiting for API response matching "${route}"`, async () => {
      const response = await this.page.waitForResponse(`**/api/v4${route}`, { timeout });
      const status = response.status();

      let body: APIResponse<T>;
      try {
        body = (await response.json()) as APIResponse<T>;
      } catch (error) {
        return {
          api_error_message: error as string,
          api_response: null,
          api_server_version: null,
          api_status_code: status
        } as APIResponse<T>;
      }

      await this.testInfo.attach(`api-response: ${response.url()}`, {
        body: JSON.stringify(body, null, 2),
        contentType: 'application/json'
      });

      return body;
    });
  }
}
