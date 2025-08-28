import type {
  Fixtures,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions
} from '@playwright/test';
import type { Logger } from 'e2e/utils/playwright.logger';

export type WaitForOptions = {
  state?: 'attached' | 'detached' | 'visible' | 'hidden';
  timeout?: number;
};

export type PlaywrightArgs = Fixtures &
  PlaywrightTestArgs &
  PlaywrightTestOptions &
  PlaywrightWorkerArgs &
  PlaywrightWorkerOptions & { logger: Logger };
