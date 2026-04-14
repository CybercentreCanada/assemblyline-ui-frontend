// wizard/steps/confirmProjectPath.ts
import fs from 'fs';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import type { WizardContext, WizardStep } from '../types';

export const confirmProjectPath: WizardStep = {
  kind: 'prep',
  label: 'Confirm project path',
  fn: async (ctx: WizardContext) => {
    const spinner = ora('Confirming project location…').start();

    spinner.succeed(`Using project directory: ${ctx.cwd}`);

    // --yes: trust cwd
    if (ctx.flags.yes) {
      return;
    }

    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Is this the correct project directory?\n${ctx.cwd}`,
        default: true
      }
    ]);

    if (confirmed) {
      return;
    }

    const { projectPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectPath',
        message: 'Enter the path to your project:',
        default: ctx.cwd,
        validate(input) {
          const resolved = path.resolve(input);

          if (!fs.existsSync(resolved)) {
            return 'Path does not exist';
          }
          if (!fs.statSync(resolved).isDirectory()) {
            return 'Path is not a directory';
          }
          return true;
        }
      }
    ]);

    ctx.cwd = path.resolve(projectPath);
  }
};
