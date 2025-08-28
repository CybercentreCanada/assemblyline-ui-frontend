/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { RESULTS_DIR } from '../../../playwright.config';

export default async function globalTeardown() {
  console.log('🧹 Cleaning up session storage files...');

  try {
    const files = fs.readdirSync(RESULTS_DIR);
    for (const file of files) {
      if (file.startsWith('session-') && file.endsWith('.json')) {
        fs.unlinkSync(path.join(RESULTS_DIR, file));
        console.log(`   Deleted: ${file}`);
      }
    }
    console.log('✅ Session cleanup complete.');
  } catch (err) {
    console.error('❌ Error during session cleanup:', err);
  }
}
