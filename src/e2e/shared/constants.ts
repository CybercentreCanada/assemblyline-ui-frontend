import path from 'path';

export const EXTERNAL_IP = process.env.EXTERNAL_IP;

export const TEST_USER: string = process.env.TEST_USER ?? 'user';
export const TEST_PASSWORD: string = process.env.TEST_PASSWORD ?? 'user';

export const ADMIN_USER: string = process.env.ADMIN_USER ?? 'admin';
export const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD ?? 'admin';

export const RESULTS_DIR = path.resolve(__dirname, '../../../playwright-results');

export const SHORT_TIMEOUT: number = 1_000;
export const MEDIUM_TIMEOUT: number = 5_000;
export const LONG_TIMEOUT: number = 30_000;
