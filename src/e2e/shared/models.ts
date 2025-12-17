import type {
  Fixtures,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions
} from '@playwright/test';

export type WaitForOptions = {
  state?: 'attached' | 'detached' | 'visible' | 'hidden';
  timeout?: number;
};

export type PlaywrightArgs = Fixtures &
  PlaywrightTestArgs &
  PlaywrightTestOptions &
  PlaywrightWorkerArgs &
  PlaywrightWorkerOptions;
