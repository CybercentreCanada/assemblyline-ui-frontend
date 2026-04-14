/* eslint-disable no-console */
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import simpleGit from 'simple-git';
import type { CreateCommandContext } from '..';

// Setup Git remote and optionally push to it.
export const addRemote = async (ctx: CreateCommandContext): Promise<CreateCommandContext> => {
  const gitDest = simpleGit(ctx.projectPath);

  const { setupRemote } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'setupRemote',
      message: 'Do you want to set a Git remote origin?',
      default: false
    }
  ]);

  if (setupRemote) {
    const { remoteUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'remoteUrl',
        message: 'Enter the remote repository URL:',
        validate: (input: string) => (input.trim() === '' ? 'Remote URL cannot be empty' : true)
      }
    ]);

    const spinnerRemote = ora('Setting remote origin...').start();
    try {
      await gitDest.addRemote('origin', remoteUrl.trim());
      spinnerRemote.succeed(chalk.gray(`Remote origin set to ${remoteUrl.trim()}`));

      // Ask if we should Push?
      const { pushNow } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'pushNow',
          message: 'Do you want to push the initial commit to the remote?',
          default: true
        }
      ]);

      // Pushtine!
      if (pushNow) {
        const spinnerPush = ora('Pushing initial commit to remote...').start();
        try {
          // Push and set upstream branch
          await gitDest.push(['-u', 'origin', 'HEAD']);
          spinnerPush.succeed(chalk.gray('Initial commit pushed to remote!'));
        } catch (err) {
          spinnerPush.fail(chalk.red('Failed to push to remote'));
          console.error(err);
        }
      }
    } catch (err) {
      spinnerRemote.fail(chalk.red('Failed to set remote origin'));
      console.error(err);
    }
  }

  return ctx;
};
