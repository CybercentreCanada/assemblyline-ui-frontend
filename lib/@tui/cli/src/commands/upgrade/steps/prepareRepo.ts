import { execa } from 'execa';
import fs, { rmSync } from 'fs';
import ora from 'ora';
import os from 'os';
import path from 'path';
import { TUI_GIT_BRANCH, TUI_GIT_URL } from '../../../configs';
import type { Framework, WizardContext, WizardStep } from '../types';

type PrepTask = {
  src: string;
  dest: Record<Framework, string | undefined>;
};

type PrepFolderTask = {
  src: string; // relative to ctx.cwd
  dest: string; // relative to ctx.cwd
};

const PREP_DELETES = [
  'dist', //
  'build',
  'node_modules',
  '.cache',
  '.eslintrc',
  'eslint.config.mjs',
  'app/entry.server.tsx',
  'app/entry.client.tsx',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',
  'app/commons',
  'commons',
  'src/commons'
];

const PREP_FOLDER_TASKS: PrepFolderTask[] = [
  { src: 'src/commons/addons', dest: 'src/addons' },
  { src: 'commons/addons', dest: 'app/addons' }
];

const PREP_TASKS: PrepTask[] = [
  // configs
  {
    src: 'packages/template/.npmrc',
    dest: {
      'remix-tui': '.npmrc',
      'template-ui': '.npmrc'
    }
  },
  {
    src: 'eslint/base.ts',
    dest: {
      'remix-tui': 'eslint.config.ts',
      'template-ui': 'eslint.config.ts'
    }
  },

  //
  {
    src: 'packages/template/app/branding/AppBrand.tsx',
    dest: {
      'remix-tui': 'app/branding/AppBrand.tsx',
      'template-ui': 'src/branding/AppBrand.tsx'
    }
  },

  // hooks
  {
    src: 'packages/template/app/hooks/useMyRouter.tsx',
    dest: {
      'remix-tui': 'app/hooks/useMyRouter.tsx',
      'template-ui': 'src/components/hooks/useMyRouter.tsx'
    }
  },
  {
    src: 'packages/template/app/hooks/useMyCookies.tsx',
    dest: {
      'remix-tui': 'app/hooks/useMyCookies.tsx',
      'template-ui': 'src/components/hooks/useMyCookies.tsx'
    }
  },
  {
    src: 'packages/template/app/hooks/useMyLeftNav.tsx',
    dest: {
      'remix-tui': 'app/hooks/useMyLeftNav.tsx',
      'template-ui': 'src/components/hooks/useMyLeftNav.tsx'
    }
  },
  {
    src: 'packages/template/app/hooks/useMyApps.tsx',
    dest: {
      'remix-tui': 'app/hooks/useMyApps.tsx',
      'template-ui': 'src/components/hooks/useMyApps.tsx'
    }
  },
  {
    src: 'packages/template/app/hooks/useMyAccessibility.tsx',
    dest: {
      'remix-tui': 'app/hooks/useMyAccessibility.tsx',
      'template-ui': 'src/components/hooks/useMyAccessibility.tsx'
    }
  },
  {
    src: 'packages/template/app/hooks/useMyNotifications.tsx',
    dest: {
      'remix-tui': 'app/hooks/useMyNotifications.tsx',
      'template-ui': 'src/components/hooks/useMyNotifications.tsx'
    }
  },
  {
    src: 'packages/template/app/entry.server.tsx',
    dest: {
      'remix-tui': 'app/entry.server.tsx',
      'template-ui': undefined
    }
  }
];

export const prepareRepo: WizardStep = {
  kind: 'prep',
  label: 'Prepare repository',
  fn: async (ctx: WizardContext) => {
    const spinner = ora('Preparing project for upgrade…').start();

    try {
      // ---- clone template repo ----
      const tmpDir = path.join(os.tmpdir(), 'upgrade-temp');
      const repoUrl = TUI_GIT_URL;
      const branch = TUI_GIT_BRANCH;
      ctx.results.referenceRepoPath = tmpDir;

      if (!ctx.flags.dryRun) {
        if (fs.existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
        await execa('git', ['clone', '--depth', '1', '--branch', branch, repoUrl, tmpDir], {
          stdio: 'ignore'
        });
      }

      // ---- copy individual files ----
      let copiedFilesCount = 0;

      for (const task of PREP_TASKS) {
        const destSubPath = task.dest[ctx.framework!];
        if (!destSubPath) continue;

        const srcPath = path.join(tmpDir, task.src);
        const destPath = path.join(ctx.cwd, destSubPath);

        if (!fs.existsSync(srcPath)) {
          spinner.warn(`[skip] Source file does not exist: ${task.src}`);
          continue;
        }

        if (!ctx.flags.dryRun) {
          await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
          await fs.promises.copyFile(srcPath, destPath);
          copiedFilesCount++;
        } else {
          spinner.info(`[dry-run] Would copy ${srcPath} → ${destPath}`);
        }
      }

      // ---- copy folders within ctx.cwd ----
      for (const task of PREP_FOLDER_TASKS) {
        const srcPath = path.join(ctx.cwd, task.src);
        const destPath = path.join(ctx.cwd, task.dest);

        if (!fs.existsSync(srcPath)) {
          spinner.warn(`[skip] Source folder does not exist: ${task.src}`);
          continue;
        }

        if (!ctx.flags.dryRun) {
          await fs.promises.mkdir(destPath, { recursive: true });
          await fs.promises.cp(srcPath, destPath, { recursive: true });
          spinner.info(`[copy] ${task.src} → ${task.dest}`);
        } else {
          spinner.info(`[dry-run] Would copy folder ${task.src} → ${task.dest}`);
        }
      }

      // ---- delete old folders/files ----
      for (const folder of PREP_DELETES) {
        const fullPath = path.join(ctx.cwd, folder);

        if (fs.existsSync(fullPath)) {
          if (ctx.flags.dryRun) {
            spinner.info(`[dry-run] Would delete ${fullPath}`);
          } else {
            spinner.info(`[delete] ${folder}`);
            await fs.promises.rm(fullPath, { recursive: true, force: true });
          }
        }
      }

      // ---- summary ----
      if (ctx.flags.dryRun) {
        spinner.succeed(`[dry-run] Prepared ${copiedFilesCount} files`);
      } else {
        spinner.succeed(`Copied ${copiedFilesCount} files`);
      }

      spinner.succeed('Project prepared for upgrade');
    } catch (err) {
      spinner.fail('Failed to prepare project');
      throw err;
    }
  }
};
