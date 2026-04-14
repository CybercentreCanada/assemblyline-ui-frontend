import chalk from 'chalk';
import fs from 'fs';
import ora from 'ora';
import path from 'path';
import type { WizardContext, WizardStep } from '../types';

const MODULES_WITH_TRANS = ['@tui/core', '@tui/notis', '@tui/a11y', '@tui/drawer'];

export const registerModuleI18n: WizardStep = {
  kind: 'mutate',
  label: 'Register @tui i18n resources',
  fn: async (ctx: WizardContext) => {
    const spinner = ora('Registering module i18n…').start();

    try {
      const i18nFile = path.join(ctx.cwd, ctx.framework === 'remix-tui' ? 'app/i18n.ts' : 'src/i18n.ts');

      // Check if i18n.ts file exists
      if (!fs.existsSync(i18nFile)) {
        spinner.warn(`No i18n.ts file found at ${chalk.cyan(i18nFile)}. Skipping i18n registration.`);
        return;
      }

      let content = '';
      if (fs.existsSync(i18nFile)) {
        content = fs.readFileSync(i18nFile, 'utf-8');
      }

      const modules = ctx.results.additionalModules || [];
      let importLinesAdded = 0;
      let callLinesAdded = 0;

      // --- split content into imports vs rest ---
      const lines = content.split('\n');
      const importLines: string[] = [];
      const otherLines: string[] = [];
      for (const line of lines) {
        if (line.startsWith('import ')) importLines.push(line);
        else otherLines.push(line);
      }

      const i18nModules = modules.filter(m => MODULES_WITH_TRANS.includes(m.name));

      for (const mod of i18nModules) {
        // Extract last segment(s) after slashes for alias
        const segments = mod.name.replace(/^@tui\//, '').split('/');
        const alias = segments.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');

        // Import line
        const importLine = `import { addTranslations as add${alias}Translations } from '${mod.name}';`;
        if (!importLines.includes(importLine)) {
          importLines.push(importLine);
          importLinesAdded++;
        }

        // Call line
        const callLine = `add${alias}Translations(i18n);`;
        if (!otherLines.includes(callLine)) {
          otherLines.push(callLine);
          callLinesAdded++;
        }
      }

      const updatedContent = [...importLines, '', ...otherLines].join('\n');

      if (!ctx.flags.dryRun) {
        fs.writeFileSync(i18nFile, updatedContent);

        spinner.succeed(
          `${chalk.cyan(i18nModules.map(m => m.name).join(', '))} translation registered in ${chalk.cyan('i18n.ts')}`
        );

        // spinner.succeed(`Added ${importLinesAdded} import(s) at top and ${callLinesAdded} call(s) at bottom`);
      } else {
        spinner.info(`[dry-run] Would add ${importLinesAdded} import(s) and ${callLinesAdded} call(s)`);
        spinner.succeed('[dry-run] i18n registration simulated');
      }
    } catch (err) {
      spinner.fail('Failed to register module i18n');
      throw err;
    }
  }
};
