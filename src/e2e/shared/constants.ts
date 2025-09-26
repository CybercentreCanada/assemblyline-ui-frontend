import path from 'path';

export const EXTERNAL_IP = process.env.EXTERNAL_IP;

export const TEST_USER_USERNAME: string = process.env.TEST_USER_USERNAME ?? 'user';
export const TEST_USER_PASSWORD: string = process.env.TEST_USER_PASSWORD ?? 'user';

export const TEST_ADMIN_USERNAME: string = process.env.TEST_ADMIN_USERNAME ?? 'admin';
export const TEST_ADMIN_PASSWORD: string = process.env.TEST_ADMIN_PASSWORD ?? 'admin';

export const RESULTS_DIR = path.resolve(__dirname, '../../../playwright-results');
export const MOCKS_DIR = path.resolve(__dirname, '../mocks');

export const SHORT_TIMEOUT = Number(process.env.TEST_SHORT_TIMEOUT ?? 1_000);
export const MEDIUM_TIMEOUT = Number(process.env.TEST_MEDIUM_TIMEOUT ?? 5_000);
export const LONG_TIMEOUT = Number(process.env.TEST_LONG_TIMEOUT ?? 30_000);
