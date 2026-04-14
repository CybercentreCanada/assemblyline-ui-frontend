/* eslint-disable no-console */
import boxen from 'boxen';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import inquirer from 'inquirer';
import path from 'path';
import { TMP_DIR } from './configs';

// Install dependencies with pnpm.
export const install = async (cwd: string) => {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('pnpm', ['install'], { cwd, stdio: 'ignore' });

    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`pnpm install exited with code ${code}`));
    });

    child.on('error', err => reject(err));
  });
};

// Install one package with pnpm.
export const installPkg = async (pkg: string, cwd: string) => {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('pnpm', ['install', pkg], { cwd, stdio: 'ignore' });

    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`pnpm install exited with code ${code}`));
    });

    child.on('error', err => reject(err));
  });
};

// Clean up if it already exists
export const getSafeTmpDir = async (): Promise<string> => {
  if (existsSync(TMP_DIR)) {
    await fs.rm(TMP_DIR, { recursive: true, force: true });
  }
  return TMP_DIR;
};

// Ensure the destination is not overwritten.
export const getSafeDestination = async (parentFolder: string, appName: string): Promise<string> => {
  let destination = path.join(parentFolder, appName);

  while (existsSync(destination)) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `Folder "${destination}" already exists. What do you want to do?`,
        choices: [
          { name: 'Overwrite', value: 'overwrite' },
          { name: 'Choose a new application name', value: 'rename' },
          { name: 'Cancel', value: 'cancel' }
        ]
      }
    ]);

    if (action === 'overwrite') {
      await fs.rm(destination, { recursive: true, force: true });
      break;
    } else if (action === 'rename') {
      const { newAppName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'newAppName',
          message: 'Enter a new application name:',
          validate: (input: string) => (input.trim() === '' ? 'Application name cannot be empty' : true)
        }
      ]);
      appName = newAppName;
      destination = path.join(parentFolder, appName);
    } else if (action === 'cancel') {
      console.log('Operation cancelled.');
      process.exit(0);
    }
  }

  return destination;
};

// Recursive copy function
export const copyRecursive = async (src: string, dest: string) => {
  const stat = await fs.stat(src);
  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    for (const entry of await fs.readdir(src)) {
      await copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    await fs.copyFile(src, dest);
  }
};

// Open VSCode @ specified folder.
export const openInVSCode = async (folder: string) => {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('code', [folder], { stdio: 'inherit' });
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`VS Code exited with code ${code}`));
    });
    child.on('error', err => reject(err));
  });
};

// Overwrite the @tui/core version held in package/template (points to 'workspace:*').
// Delete all other @tui modules from base package.json
// export const preparePackageJson = async (destination: string, version: string) => {
//   const packageJsonPath = path.join(destination, 'package.json');
//   try {
//     const pkgRaw = await fs.readFile(packageJsonPath, 'utf-8');
//     const pkgJson = JSON.parse(pkgRaw);

//     pkgJson.dependencies['@tui/core'] = version;

//     // Remove non-core modules from package.json
//     for (const tuiModule of TUI_MODULES) {
//       if (pkgJson.dependencies && pkgJson.dependencies[tuiModule]) {
//         delete pkgJson.dependencies[tuiModule];
//       }
//     }

//     await fs.writeFile(packageJsonPath, JSON.stringify(pkgJson, null, 2));
//   } catch (err) {
//     console.error(chalk.red(`❌ failed to update @tui/core @ ${version} in package.json:`), err);
//   }
// };

// Overwrite the @tui/core version held in package/template (points to 'workspace:*').
// Delete all other @tui modules from base package.json
export const cleanPkgVersion = async (destination: string, selectedTuiModules: string[]) => {
  const packageJsonPath = path.join(destination, 'package.json');
  try {
    let updated = false;

    const pkgRaw = await fs.readFile(packageJsonPath, 'utf-8');
    const pkgJson = JSON.parse(pkgRaw);

    pkgJson['dependencies'] = Object.fromEntries(
      Object.entries(pkgJson['dependencies']).filter(([name]) => {
        const keep = !name.startsWith('@tui') || selectedTuiModules.includes(name);

        if (!keep && !updated) {
          updated = true;
        }

        return keep;
      })
    );

    if (updated) {
      await fs.writeFile(packageJsonPath, JSON.stringify(pkgJson, null, 2));
    }
  } catch (err) {
    console.error(chalk.red(`❌ failed to clean package.json:`), err);
  }
};

// Overwrite the version of a package.json dependency.
export const updatePkgVersion = async (destination: string, pkg: string, version: string) => {
  const packageJsonPath = path.join(destination, 'package.json');
  try {
    const pkgRaw = await fs.readFile(packageJsonPath, 'utf-8');
    const pkgJson = JSON.parse(pkgRaw);

    let updated = false;

    if (pkgJson.dependencies && pkgJson.dependencies[pkg]) {
      pkgJson.dependencies[pkg] = version;
      updated = true;
    }

    if (updated) {
      await fs.writeFile(packageJsonPath, JSON.stringify(pkgJson, null, 2));
    }
  } catch (err) {
    console.error(chalk.red(`❌ failed to update ${pkg} @ ${version} in package.json:`), err);
  }
};

// Boxed instruction to launch application.
export const printLaunchInstructions = (destination: string) => {
  const command = `cd ${destination} && pnpm run dev`;

  const lines = [
    chalk.bold.green('🎉 Your @tui application is ready!\n'),
    chalk.white('To start the application, run:\n'),
    chalk.gray(command)
  ];

  const boxedMessage = boxen(lines.join('\n'), {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: 0,

    borderStyle: 'round',
    borderColor: 'green'
  });

  console.log(boxedMessage);
};
