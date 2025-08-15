import type { Page, TestInfo } from '@playwright/test';
import type { APIResponse } from 'components/core/Query/components/api.models';
import { WhoAmIProps } from 'components/hooks/useMyUser';
import type { Logger } from 'e2e/utils/playwright.logger';
import type { PlaywrightArgs } from 'e2e/utils/playwright.models';

const DEFAULT_RESPONSE: APIResponse<unknown> = {
  api_error_message: '',
  api_response: null,
  api_server_version: '4.6.0.dev0',
  api_status_code: 200
};

type GetRoutes = {
  '/api/v4/user/whoami/': WhoAmIProps;
};

type PostRoutes = {
  '/api/v4/user/whoami/': WhoAmIProps;
};

type MockAPIFixture = (r: API) => Promise<void>;

export class API {
  constructor(
    private page: Page,
    private logger: Logger,
    private testInfo: TestInfo
  ) {}

  static fixture =
    () =>
    async ({ page, logger }: PlaywrightArgs, use: MockAPIFixture, testInfo: TestInfo) => {
      const mockAPI = new API(page, logger, testInfo);
      await use(mockAPI);
    };

  async get<K extends keyof GetRoutes>(key: K, api_response: GetRoutes[K]) {
    this.logger.info(`Mocked API: ${key}`);

    await this.page.route(`**${key}`, async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: { ...DEFAULT_RESPONSE, api_response } });
      }
    });
  }

  async post<K extends keyof GetRoutes>(key: K, api_response: GetRoutes[K]) {
    this.logger.info(`Mocked API: ${key}`);

    await this.page.route(`**${key}`, async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ json: { ...DEFAULT_RESPONSE, api_response } });
      }
    });
  }
}
