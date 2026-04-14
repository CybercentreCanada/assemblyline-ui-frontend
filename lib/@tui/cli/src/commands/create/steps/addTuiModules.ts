/* eslint-disable no-console */
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import type { CreateCommandContext } from '..';
import { TUI_MODULES_ADDONS } from '../../../configs';
import { cleanPkgVersion, updatePkgVersion } from '../utils';

// Select @tui modules to install
export const addTuiModules = async (ctx: CreateCommandContext): Promise<CreateCommandContext> => {
  const { selectedModules } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedModules',
      message: 'Which additional @tui modules would you like to install?',
      choices: TUI_MODULES_ADDONS,
      default: TUI_MODULES_ADDONS
    }
  ]);

  ctx.selectedModules = ['@tui/core', ...(selectedModules || [])];

  for (const module of ctx.selectedModules) {
    const spinner = ora(`Installing ${module}  modules...`).start();
    try {
      // await installPkg(`${module}@${version}`, projectPath);
      await cleanPkgVersion(ctx.projectPath, ctx.selectedModules);
      await updatePkgVersion(ctx.projectPath, module, ctx.version);
      spinner.succeed(chalk.gray(`${module}@${ctx.version} installed!`));
    } catch (error) {
      spinner.fail(`Failed to install ${module}`);
      console.error(error);
    }
  }

  return ctx;
};
