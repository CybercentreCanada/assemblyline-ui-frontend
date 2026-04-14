/* eslint-disable no-console */
import { execa } from 'execa';
import ora from 'ora';
import type { WizardContext, WizardStep } from '../types';

export const commitStep: (label: string) => WizardStep = (label: string) => {
  return {
    kind: 'commit',
    label,
    fn: async (ctx: WizardContext) => {
      const spinner = ora(`Committing: ${label}`).start();

      try {
        await execa('git', ['add', '.'], { cwd: ctx.cwd });
        await execa('git', ['commit', '-m', label], { cwd: ctx.cwd });

        spinner.succeed(`Committed: ${label}`);
      } catch {
        spinner.warn(`Skipped commit: ${label}`);
      }
    }
  };
};
