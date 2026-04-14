/* eslint-disable no-console */
import { execa } from 'execa';
import fs from 'fs';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import type { WizardContext, WizardStep } from '../types';

export const preflight: WizardStep = {
  kind: 'prep',
  label: 'Run preflight checks',
  fn: async (ctx: WizardContext) => {
    const spinner = ora('Running preflight checks…').start();
    const warnings: string[] = [];

    // ---------------------
    // package.json
    // ---------------------
    const pkgPath = path.join(ctx.cwd, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      spinner.fail('package.json not found');
      throw new Error('This does not appear to be a project root (package.json missing)');
    }

    try {
      ctx.packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      spinner.info('package.json found');
    } catch {
      spinner.fail('package.json is not valid JSON');
      throw new Error('Invalid package.json');
    }

    // ---------------------
    // Git checks
    // ---------------------
    try {
      await execa('git', ['rev-parse', '--is-inside-work-tree'], { cwd: ctx.cwd });
      ctx.git = { isRepo: true };

      const { stdout } = await execa('git', ['status', '--porcelain'], { cwd: ctx.cwd });
      ctx.git.clean = stdout.trim().length === 0;
      if (!ctx.git.clean) warnings.push('Git working tree is not clean');
      else spinner.info('Git working tree is clean');
    } catch {
      ctx.git = { isRepo: false };
      warnings.push('Not a git repository');
    }

    // ---------------------
    // PNPM detection
    // ---------------------
    try {
      const { stdout } = await execa('pnpm', ['--version']);
      ctx.results.pnpmInstalled = true;
      ctx.results.pnpmVersion = stdout.trim();
      spinner.info(`pnpm detected (v${ctx.results.pnpmVersion})`);
    } catch {
      ctx.results.pnpmInstalled = false;
      spinner.warn('pnpm not found');
    }

    spinner.stop();

    // ---------------------
    // Warnings summary
    // ---------------------
    if (warnings.length > 0) {
      ora().warn('Preflight warnings:');
      warnings.forEach(w => console.warn(`  • ${w}`));

      if (!ctx.flags.yes) {
        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Continue anyway?',
            default: false
          }
        ]);

        if (!proceed) throw new Error('Upgrade aborted by user');
      }
    } else {
      ora().succeed('Preflight checks passed');
    }
  }
};
