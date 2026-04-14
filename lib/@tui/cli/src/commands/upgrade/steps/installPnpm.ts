/* eslint-disable no-console */
import chalk from 'chalk';
import { execa } from 'execa';
import inquirer from 'inquirer';
import ora from 'ora';
import type { WizardContext, WizardStep } from '../types';

export const installPnpm: WizardStep = {
  label: 'Install PNPM',
  kind: 'prep',
  fn: async ctx => {
    const { cwd } = ctx;

    const { install } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'install',
        message: 'pnpm is not installed. Install it now?',
        default: true
      }
    ]);

    if (!install) {
      console.log(chalk.yellow('Skipping PNPM installation. You will need it to continue.'));
      return;
    }

    const spinner = ora('Installing PNPM…').start();

    try {
      // Using execa for all commands
      await execa('npm', ['install', '-g', 'pnpm'], { stdio: 'pipe', cwd });

      spinner.succeed(chalk.green('PNPM installed successfully'));
      ctx.results.pnpmInstalled = true;
    } catch (err: any) {
      spinner.fail(chalk.red('Failed to install PNPM'));
      throw err;
    }
  },
  skipIf: (ctx: WizardContext) => !!ctx.results.pnpmInstalled
};
