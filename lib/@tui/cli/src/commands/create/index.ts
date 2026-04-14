/* eslint-disable no-console */
import chalk from 'chalk';
import { TUI_NPM_VERSION } from '../../configs';
import { addRemote } from './steps/addRemote';
import { addTuiModules } from './steps/addTuiModules';
import { installDeps } from './steps/installDeps';
import { openVsCode } from './steps/openVsCode';
import { prepareProject } from './steps/prepareProject';
import { projectName } from './steps/projectName';
import { printLaunchInstructions } from './utils';

const steps = [
  projectName, //
  prepareProject,
  addTuiModules,
  installDeps,
  addRemote,
  openVsCode
];

export type CreateCommandContext = {
  version: string;
  appName?: string;
  projectPath?: string;
  selectedModules?: string[];
};

export const create = async () => {
  const ctx: CreateCommandContext = {
    version: TUI_NPM_VERSION
  };

  try {
    for (const step of steps) {
      await step(ctx);
    }

    printLaunchInstructions(ctx.projectPath);
  } catch (err) {
    console.error(chalk.red('An error occurred:'), err);
    process.exit(1);
  }
};
