import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const externalIP = process.env.EXTERNAL_IP;
if (!externalIP) {
  throw new Error('EXTERNAL_IP is not defined in .env');
}

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  testDir: './tests/e2e',
  outputDir: './playwright-results/test-results',
  reporter: [['list'], ['html', { outputFolder: './playwright-results/html-report' }]],

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `https://${externalIP}.nip.io`,
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure'
      }
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: `https://${externalIP}.nip.io`,
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure'
      }
    },
    {
      name: 'edge',
      use: {
        // Uncomment below if msedge installed via playwright or system path recognized
        // channel: 'msedge',

        // If 'msedge' channel errors, comment it out to fallback to chromium engine:
        ...devices['Desktop Edge'],
        baseURL: `https://${externalIP}.nip.io`,
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure'
      }
    }
  ]
});
