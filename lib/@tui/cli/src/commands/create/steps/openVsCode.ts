/* eslint-disable no-console */
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import type { CreateCommandContext } from '..';
import { openInVSCode } from '../utils';

// Ask if user wants to open in VS Code
export const openVsCode = async (ctx: CreateCommandContext): Promise<CreateCommandContext> => {
  const { openVSCode } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'openVSCode',
      message: 'Do you want to open the application in VS Code?',
      default: true
    }
  ]);

  if (openVSCode) {
    const spinnerVSCode = ora('Opening VS Code...').start();
    try {
      await openInVSCode(ctx.projectPath);
      spinnerVSCode.succeed(chalk.gray('VS Code launched!'));
    } catch (err) {
      spinnerVSCode.fail(chalk.red('Failed to launch VS Code'));
      console.error(err);
    }
  }

  return ctx;
};
