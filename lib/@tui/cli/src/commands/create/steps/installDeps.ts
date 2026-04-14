/* eslint-disable no-console */
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import simpleGit from 'simple-git';
import type { CreateCommandContext } from '..';
import { TUI_GIT_DEFAULT_BRANCH } from '../../../configs';
import { install } from '../utils';

// Ask to install dependencies
export const installDeps = async (ctx: CreateCommandContext): Promise<CreateCommandContext> => {
  const { installDeps } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installDeps',
      message: 'Do you want to install dependencies using pnpm?',
      default: true
    }
  ]);

  // Install deps with pnpm.
  if (installDeps) {
    const spinnerPnmpInstall = ora('Installing dependencies...').start();
    try {
      await install(ctx.projectPath);
      spinnerPnmpInstall.succeed(chalk.gray(`Dependencies installed!`));
    } catch (err) {
      spinnerPnmpInstall.fail('Failed to install dependencies');
      console.error(err);
    }
  }

  // Initialize Git in the destination folder
  const spinnerGit = ora('Initializing Git repository...').start();
  const gitDest = simpleGit(ctx.projectPath);
  await gitDest.init();
  await gitDest.add('.');
  await gitDest.commit('Initial commit');
  await gitDest.raw(['branch', '-M', TUI_GIT_DEFAULT_BRANCH]);
  spinnerGit.succeed(chalk.gray('Git repository initialized!'));

  //
  return ctx;
};
