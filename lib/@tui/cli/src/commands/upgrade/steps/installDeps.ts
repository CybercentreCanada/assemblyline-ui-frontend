/* eslint-disable no-console */
import chalk from 'chalk';
import { execa } from 'execa';
import inquirer from 'inquirer';
import ora from 'ora';
import type { WizardStep } from '../types';

export const installDeps: WizardStep = {
  label: 'Install dependencies (pnpm)',
  kind: 'prep',

  fn: async ctx => {
    const cwd = ctx.cwd;

    // Skip if dry-run
    if (ctx.flags.dryRun) {
      console.log(chalk.yellow('[dry-run] Skipping `pnpm install`'));
      return;
    }

    // Ask user to confirm
    const { shouldInstall } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldInstall',
        message: 'Do you want to run `pnpm install` now?',
        default: true
      }
    ]);

    if (!shouldInstall) {
      console.log(chalk.yellow('Skipping install. You will need to run `pnpm install` manually.'));
      return;
    }

    const spinner = ora('Running `pnpm install`...').start();

    try {
      // Run silently, capture output
      await execa('pnpm', ['install'], {
        cwd,
        stdio: 'pipe'
      });

      spinner.succeed(chalk.green('Dependencies installed'));

      // Record log in WizardContext
      ctx.results.codemodLogs = ctx.results.codemodLogs || {};
      ctx.results.codemodLogs['installDeps'] = 'pnpm install completed successfully';
    } catch (err: any) {
      spinner.fail(chalk.red('Failed to install dependencies'));

      ctx.results.codemodLogs = ctx.results.codemodLogs || {};
      ctx.results.codemodLogs['installDeps'] = err.message;

      throw err; // bubble up
    }
  },

  skipIf: ctx => !!ctx.flags.noInstall
};
