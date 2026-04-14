import chalk from 'chalk';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import simpleGit from 'simple-git';
import type { CreateCommandContext } from '..';
import { TUI_GIT_BRANCH, TUI_GIT_URL, TUI_TEMPLATE_FOLDER } from '../../../configs';
import { SRC_EXTRA_FILES, SRC_VSCODE_FOLDER } from '../configs';
import { copyRecursive, getSafeDestination, getSafeTmpDir } from '../utils';

// Initialize simple-git instance.
const git = simpleGit();

// Ask where to create it, and copy over resources from @tui/template
export const prepareProject = async (ctx: CreateCommandContext): Promise<CreateCommandContext> => {
  const { parentFolder } = await inquirer.prompt([
    {
      type: 'input',
      name: 'parentFolder',
      message: `Where do you want "${ctx.appName}" to be created?`,
      default: process.cwd()
    }
  ]);

  // Ensure we have what we need.
  if (!ctx.appName) {
    throw Error('No application name defined in context.');
  }

  // Calculate where to copy the clone repo.
  const destination = await getSafeDestination(parentFolder, ctx.appName);
  const tmpDir = await getSafeTmpDir();

  // Clone tui repo.
  const spinnerClone = ora(`Cloning template repository...`).start();
  await git.clone(TUI_GIT_URL, tmpDir, ['--branch', TUI_GIT_BRANCH, '--single-branch']);
  spinnerClone.succeed(chalk.gray('@tui repository cloned!'));

  // Copy file template repo files over to new repo folder.
  const spinner = ora('Copying template files...').start();

  // packages/template folder.
  const templateSrc = path.join(tmpDir, TUI_TEMPLATE_FOLDER);
  await copyRecursive(templateSrc, destination);

  // .vscode folder.
  const vscodeSrc = path.join(tmpDir, SRC_VSCODE_FOLDER);
  const vscodeDest = path.join(destination, '.vscode');
  await copyRecursive(vscodeSrc, vscodeDest);

  // extra files.
  for (const file of SRC_EXTRA_FILES) {
    const src = path.join(tmpDir, file.src);
    const dest = path.join(destination, file.dest);

    if (existsSync(src)) {
      await copyRecursive(src, dest);
    }
  }

  // Done copied files.
  spinner.succeed(chalk.gray('@tui/template files copied!'));

  // Cleanup temporary repo
  await fs.rm(tmpDir, { recursive: true, force: true });

  //
  ctx.projectPath = destination;

  //
  return ctx;
};
