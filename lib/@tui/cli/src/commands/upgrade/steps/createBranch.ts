import { execa } from 'execa';
import inquirer from 'inquirer';
import ora from 'ora';
import type { WizardContext, WizardStep } from '../types';

export const createBranch: WizardStep = {
  kind: 'prep',
  label: 'Create upgrade branch',
  fn: async (ctx: WizardContext) => {
    if (!ctx.git?.isRepo) {
      ora().warn('Not a git repository — skipping branch creation');
      return;
    }

    let branchName: string;

    if (ctx.flags.yes) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      branchName = `upgrade/${timestamp}`;
      ora().info(`Creating branch ${branchName}`);
    } else {
      const { inputName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'inputName',
          message: 'Enter a new branch name for the upgrade:',
          default: `upgrade/${new Date().toISOString().replace(/[:.]/g, '-')}`,
          async validate(name) {
            const trimmed = typeof name === 'string' ? name.trim() : '';
            if (!trimmed) return 'Branch name cannot be empty';

            try {
              const [{ stdout: localStdout }, { stdout: remoteStdout }] = await Promise.all([
                execa('git', ['branch', '--list'], { cwd: ctx.cwd }),
                execa('git', ['branch', '-r', '--list'], { cwd: ctx.cwd })
              ]);

              const existingLocal = localStdout
                .split('\n')
                .map(b => b.replace(/^\*\s*/, '').trim())
                .filter(Boolean);

              if (existingLocal.includes(trimmed)) return 'Branch already exists';

              const existingRemote = remoteStdout
                .split('\n')
                .map(b => b.trim())
                .filter(Boolean)
                .filter(b => !b.includes('->'));

              const remoteCollision = existingRemote.some(b => b.endsWith(`/${trimmed}`));
              if (remoteCollision) return 'Branch already exists on remote';
            } catch {
              return 'Failed to list branches';
            }

            return true;
          }
        }
      ]);

      branchName = inputName.trim();
    }

    const spinner = ora(`Creating and switching to branch ${branchName}`).start();

    try {
      await execa('git', ['checkout', '-b', branchName], {
        cwd: ctx.cwd,
        stdio: 'ignore' // 👈 prevent Git from printing
      });
      spinner.succeed(`Switched to new branch: ${branchName}`);
    } catch (err) {
      spinner.fail('Failed to create/switch branch');
      throw err;
    }
  }
};
