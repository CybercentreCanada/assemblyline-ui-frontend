// wizard/steps/detectFramework.ts
import fs from 'fs';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import type { Framework, WizardContext, WizardStep } from '../types';

export const FRAMEWORK_CHOICES: Record<Framework, string> = {
  'remix-tui': 'Remix / React Router v7 (app/ directory)',
  'template-ui': 'Template UI (CRA / Vite, src/ directory)'
};

export const detectFramework: WizardStep = {
  kind: 'prep',
  label: 'Detect framework',
  fn: async (ctx: WizardContext) => {
    const spinner = ora('Detecting project framework…').start();

    const appDir = path.join(ctx.cwd, 'app');
    const srcDir = path.join(ctx.cwd, 'src');

    const hasApp = fs.existsSync(appDir) && fs.statSync(appDir).isDirectory();
    const hasSrc = fs.existsSync(srcDir) && fs.statSync(srcDir).isDirectory();

    let detected: Framework | undefined;

    if (hasApp && !hasSrc) detected = 'remix-tui';
    if (hasSrc && !hasApp) detected = 'template-ui';

    if (detected) {
      spinner.succeed(
        detected === 'remix-tui'
          ? 'Found app/ directory → assuming Remix / RR v7'
          : 'Found src/ directory → assuming CRA / Vite'
      );
    } else if (hasApp && hasSrc) {
      spinner.warn('Both app/ and src/ directories found');
    } else {
      spinner.warn('Could not detect framework from project structure');
    }

    // --yes: trust detection, or force choice if ambiguous
    if (ctx.flags.yes && detected) {
      ctx.framework = detected;
      return;
    }

    // If detection was confident, ask for confirmation
    if (detected) {
      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: `Does this look correct? (${detected})`,
          default: true
        }
      ]);

      if (confirmed) {
        ctx.framework = detected;
        return;
      }
    }

    // Ambiguous or rejected → explicit choice
    const { framework } = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Which framework are you upgrading from?',
        choices: Object.entries(FRAMEWORK_CHOICES).map(([value, name]) => ({
          value,
          name
        }))
      }
    ]);

    ctx.framework = framework;
  }
};
