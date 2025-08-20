/* eslint-disable no-console */
import { chromium, defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';
import chalk from 'chalk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

// Validate env vars
const EXTERNAL_IP = process.env.EXTERNAL_IP;
if (!EXTERNAL_IP) throw new Error('❌ EXTERNAL_IP is not defined in .env');

const BASE_URL = `https://${EXTERNAL_IP}.nip.io`;
const RESULTS_DIR = path.resolve(__dirname, 'playwright-results');

if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

const BROWSERS = [
  {
    name: 'chromium',
    label: 'chrome',
    color: chalk.yellow,
    device: devices['Desktop Chrome'],
    browserType: chromium
  }
  // {
  //   name: 'firefox',
  //   label: 'firefox',
  //   color: chalk.red,
  //   device: devices['Desktop Firefox'],
  //   browserType: firefox
  // },
  // {
  //   name: 'webkit',
  //   label: 'safari',
  //   color: chalk.blue,
  //   device: devices['Desktop Safari'],
  //   browserType: webkit
  // }
] as const;

const baseUseConfig: PlaywrightTestConfig['use'] = {
  baseURL: BASE_URL,
  headless: true,
  ignoreHTTPSErrors: true,
  viewport: { width: 1920, height: 1080 },
  screenshot: process.env.CI ? 'only-on-failure' : 'on',
  trace: process.env.CI ? 'retain-on-failure' : 'on',
  video: process.env.CI ? 'retain-on-failure' : 'on'
};

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  globalTeardown: path.resolve(__dirname, './src/e2e/shared/teardown.ts'),
  outputDir: `${RESULTS_DIR}/results`,
  reporter: [
    ['list'],
    ['html', { open: 'always', outputFolder: `${RESULTS_DIR}/html-report` }],
    ['junit', { outputFile: `${RESULTS_DIR}/junit-results.xml` }]
  ],
  retries: process.env.CI ? 2 : 0,
  testDir: './src/e2e',
  testMatch: /.*\.spec\.tsx?$/,
  timeout: 120_000,
  use: baseUseConfig,
  projects: BROWSERS.flatMap(({ name, device }) => [
    // Setup projects (auth)
    {
      name: `${name}-setup`,
      use: {
        ...device,
        ...baseUseConfig
      },
      testDir: path.resolve(__dirname, './src/e2e'),
      testMatch: /setup\.ts$/
    },
    // Main test projects
    {
      name,
      use: {
        ...device,
        ...baseUseConfig,
        storageState: path.join(RESULTS_DIR, `${name}-admin-session.json`)
      },
      dependencies: [`${name}-setup`]
    }
  ])
});
