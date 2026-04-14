import os from 'os';
import path from 'path';

export const SRC_EXTRA_FILES = [
  { src: '.gitignore', dest: '.gitignore' },
  { src: 'eslint/base.ts', dest: 'eslint.config.ts' }
];
export const SRC_VSCODE_FOLDER = '.vscode';
export const DEFAULT_CLONE_FOLDER = path.join(os.homedir(), 'tui-apps');
export const TMP_DIR = path.join(os.homedir(), '.tmp-repo');
