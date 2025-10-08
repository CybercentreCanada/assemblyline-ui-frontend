/* eslint-disable no-console */
import { chromium, defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env (quietly if missing)
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

// Determine base URL
const TEST_BASE_URL = process.env.TEST_BASE_URL;
const EXTERNAL_IP = process.env.EXTERNAL_IP;

let BASE_URL: string;

if (TEST_BASE_URL) {
  BASE_URL = TEST_BASE_URL;
} else if (EXTERNAL_IP) {
  BASE_URL = `https://${EXTERNAL_IP}.nip.io`;
  console.warn(`⚠️ TEST_BASE_URL not defined, using EXTERNAL_IP fallback: ${BASE_URL}`);
} else {
  BASE_URL = 'http://localhost';
  console.warn('⚠️ Neither TEST_BASE_URL nor EXTERNAL_IP defined, using default: http://localhost');
}

// Prepare results directory
const RESULTS_DIR = path.resolve(__dirname, 'playwright-report');
fs.mkdirSync(RESULTS_DIR, { recursive: true });

// Define browsers
const BROWSERS = [
  {
    name: 'chromium',
    label: 'chrome',
    device: devices['Desktop Chrome'],
    browserType: chromium
  }
  // {
  //   name: 'firefox',
  //   label: 'firefox',
  //   device: devices['Desktop Firefox'],
  //   browserType: firefox
  // },
  // {
  //   name: 'webkit',
  //   label: 'safari',
  //   device: devices['Desktop Safari'],
  //   browserType: webkit
  // }
] as const;

// Base use configuration
const baseUseConfig: PlaywrightTestConfig['use'] = {
  baseURL: BASE_URL,
  headless: true,
  ignoreHTTPSErrors: true,
  viewport: { width: 1920, height: 1080 },
  screenshot: process.env.CI ? 'only-on-failure' : 'on',
  trace: process.env.CI ? 'retain-on-failure' : 'on',
  video: process.env.CI ? 'retain-on-failure' : 'on'
};

// Export Playwright configuration
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
  retries: process.env.CI ? 0 : 0,
  testDir: './src/e2e',
  testMatch: /.*\.spec\.tsx?$/,
  timeout: 120_000,
  use: baseUseConfig,
  workers: process.env.CI ? 1 : 4,
  projects: BROWSERS.flatMap(({ name, device }) => [
    // Setup project (for authentication, etc.)
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
