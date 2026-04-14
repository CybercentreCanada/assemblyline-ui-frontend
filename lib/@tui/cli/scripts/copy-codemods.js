import fs from 'fs';
import path from 'path';

const src = path.resolve('src/commands/upgrade/codemods/codeshift');

const dest = path.resolve('dist/commands/upgrade/codemods/codeshift');

fs.cpSync(src, dest, { recursive: true });

console.log('✓ Codemods copied');
