/* eslint-disable no-console */
import fs from 'fs';
import ora from 'ora';
import path from 'path';
import type { WizardContext, WizardStep } from '../types';

export const addModules: WizardStep = {
  kind: 'mutate',
  label: 'Install selected @tui modules',
  fn: async (ctx: WizardContext) => {
    const modules = [...(ctx.results.additionalModules || [])];

    const spinner = ora('Updating package.json with additional modules…').start();

    try {
      const packageJsonPath = path.join(ctx.cwd, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Ensure dependencies field exists
      if (!packageJson.dependencies) packageJson.dependencies = {};

      // Add/update selected modules
      for (const mod of modules) {
        packageJson.dependencies[mod.name] = mod.version || 'latest';
      }

      if (ctx.flags.dryRun) {
        spinner.info(
          `[dry-run] Would update package.json with: ${modules.map(m => `${m.name}@${m.version || 'latest'}`).join(', ')}`
        );
      } else {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
        spinner.succeed(`Updated package.json with ${modules.length} module(s)`);
      }
    } catch (err: any) {
      spinner.fail('Failed to update package.json');
      console.error(err.message);
      throw err;
    }
  }
};
