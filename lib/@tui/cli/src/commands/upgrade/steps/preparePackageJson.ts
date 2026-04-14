/* eslint-disable no-console */
import fs from 'fs';
import ora from 'ora';
import path from 'path';
import type { WizardContext, WizardStep } from '../types';

// Packages to always add or upgrade
const MANDATORY_UPGRADES: { name: string; version: string; dev?: boolean }[] = [
  { name: '@mui/icons-material', version: '^7.3.7' },
  { name: '@mui/material', version: '^7.3.7' },
  { name: 'react', version: '^19.2.3' },
  { name: 'react-dom', version: '^19.2.3' },
  { name: 'react-router', version: '^7.12.0' },
  { name: 'react-markdown', version: '^10.1.0' },
  { name: 'react-i18next', version: '^16.2.1' },
  { name: 'i18next', version: '^25.6.0' },
  { name: '@react-router/fs-routes', version: '^7.12.0' },
  { name: '@react-router/node', version: '^7.12.0' },
  { name: '@react-router/serve', version: '^7.12.0' },

  { name: '@types/eslint-plugin-jsx-a11y', version: '^6.10.1', dev: true },
  { name: '@types/react', version: '^19.2.2', dev: true },
  { name: '@types/react-dom', version: '^19.2.2', dev: true },

  { name: '@typescript-eslint/eslint-plugin', version: '^8.46.1', dev: true },
  { name: '@typescript-eslint/parser', version: '^8.46.1', dev: true },

  { name: '@react-router/dev', version: '^7.12.0', dev: true },

  { name: '@eslint/compat', version: '^1.4.0', dev: true },
  { name: '@eslint/eslintrc', version: '^3.3.1', dev: true },
  { name: '@eslint/js', version: '^9.38.0', dev: true },

  { name: 'eslint', version: '^9.38.0', dev: true },
  { name: 'eslint-import-resolver-typescript', version: '^4.4.4', dev: true },
  { name: 'eslint-plugin-import', version: '^2.32.0', dev: true },
  { name: 'eslint-plugin-jsx-a11y', version: '^6.10.2', dev: true },
  { name: 'eslint-plugin-react', version: '^7.37.5', dev: true },
  { name: 'eslint-plugin-react-hooks', version: '^7.0.0', dev: true },

  { name: 'globals', version: '^16.4.0', dev: true },
  { name: 'jiti', version: '^2.6.1', dev: true },

  { name: 'typescript', version: '^5.9.3', dev: true },
  { name: 'typescript-eslint', version: '^8.46.1', dev: true },

  { name: 'vite', version: '^7.1.10', dev: true },
  { name: 'vite-tsconfig-paths', version: '^5.1.4', dev: true }
];

// Packages to remove
const DEPRECATED_DEPS = [
  'react-router-dom',
  'eslint-config-airbnb-base',
  'eslint-config-airbnb-typescript',
  'eslint-config-prettier',
  'eslint-config-react',
  'eslint-import-resolver-node'
];

export const prepPackageJson: WizardStep = {
  kind: 'mutate',
  label: 'Update package.json',
  fn: async (ctx: WizardContext) => {
    const spinner = ora('Preparing package.json…').start();

    try {
      const packageJsonPath = path.join(ctx.cwd, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      packageJson.dependencies ||= {};
      packageJson.devDependencies ||= {};

      // 1️⃣ Add/update mandatory upgrades
      for (const dep of MANDATORY_UPGRADES) {
        const section = dep.dev ? 'devDependencies' : 'dependencies';
        packageJson[section][dep.name] = dep.version;
        if (!ctx.flags.dryRun) continue;
        spinner.info(`[dry-run] Would add/update ${section}: ${dep.name}@${dep.version}`);
      }

      // 2️⃣ Remove deprecated packages
      for (const dep of DEPRECATED_DEPS) {
        delete packageJson.dependencies[dep];
        delete packageJson.devDependencies[dep];
        if (!ctx.flags.dryRun) continue;
        spinner.info(`[dry-run] Would remove ${dep} from dependencies/devDependencies`);
      }

      // 3️⃣ Write changes if not dry-run
      if (!ctx.flags.dryRun) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
        spinner.succeed(
          `package.json prepared: ${MANDATORY_UPGRADES.length + (ctx.results.additionalModules?.length || 0)} added/updated, ${DEPRECATED_DEPS.length} removed`
        );
      } else {
        spinner.info('[dry-run] package.json changes simulated (no file written)');
      }
    } catch (err: any) {
      spinner.fail('Failed to prepare package.json');
      console.error(err.message);
      throw err;
    }
  }
};
