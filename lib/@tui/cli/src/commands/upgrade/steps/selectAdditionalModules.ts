import inquirer from 'inquirer';
import { TUI_MODULES_ADDONS } from '../../../configs';
import type { WizardContext, WizardStep } from '../types';

export const selectAdditionalModules: WizardStep = {
  kind: 'mutate',
  label: 'Select additional @tui modules',
  fn: async (ctx: WizardContext) => {
    // Step 1: pick which modules
    const { modules } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'modules',
        message: 'Which additional modules would you like to install?',
        choices: TUI_MODULES_ADDONS
      }
    ]);

    if (!modules.length) {
      ctx.results.additionalModules = [];
      return;
    }

    // Step 2: ask for a default version (optional)
    const { defaultVersion } = await inquirer.prompt([
      {
        type: 'input',
        name: 'defaultVersion',
        message: 'Specify the version for all selected modules (leave blank for latest):',
        default: ctx.results.defaultTuiVersion || 'latest'
      }
    ]);

    ctx.results.defaultTuiVersion = defaultVersion || 'latest';

    // Assign the same version to all selected modules
    ctx.results.additionalModules = ['@tui/core', ...modules].map((name: string) => ({
      name,
      version: ctx.results.defaultTuiVersion
    }));
  }
};
