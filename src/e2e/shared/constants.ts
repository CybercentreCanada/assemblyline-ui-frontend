import path from 'path';

export const EXTERNAL_IP = process.env.EXTERNAL_IP;

export const TEST_USER_USERNAME: string = process.env.USER_USERNAME ?? 'user';
export const TEST_USER_PASSWORD: string = process.env.USER_PASSWORD ?? 'user';

export const TEST_ADMIN_USERNAME: string = process.env.ADMIN_USER ?? 'admin';
export const TEST_ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD ?? 'admin';

export const RESULTS_DIR = path.resolve(__dirname, '../../../playwright-results');

export const SHORT_TIMEOUT: number = 1_000;
export const MEDIUM_TIMEOUT: number = 5_000;
export const LONG_TIMEOUT: number = 30_000;
