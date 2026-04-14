/* eslint-disable no-console */
import chalk from 'chalk';
import { execa } from 'execa';
import fs from 'fs';
import ora from 'ora';
import path from 'path';
import stringWidth from 'string-width';
import type { CodemodStatus, CodemodSummary, WizardContext } from '../types';

const CODESHIFT_DIR = path.resolve(__dirname, 'commands/upgrade/codemods/codeshift');

export function printCodemodStepSummary(result: CodemodStatus) {
  const summary = result.summary;

  if (!summary) {
    console.log(chalk.yellow('  No summary available.\n'));
    return;
  }

  // Calculate max label length
  const maxLabelLength = Math.max(...['Errors', 'Unmodified', 'Skipped', 'Ok', 'Time'].map(l => l.length));

  // Helper to pad labels
  const pad = (label: string) => label.padEnd(maxLabelLength, ' ');

  const lines = [
    { label: 'Errors', value: summary.errors, icon: summary.errors > 0 ? '❌' : '✅', color: chalk.red },
    { label: 'Unmodified', value: summary.unmodified, icon: '⚪', color: chalk.gray },
    { label: 'Skipped', value: summary.skipped, icon: '⏭', color: chalk.yellow },
    { label: 'Ok', value: summary.ok, icon: '✅', color: chalk.green }
  ];

  const ICON_PAD = 2;

  for (const line of lines) {
    const symbolWidth = stringWidth(line.icon);
    const paddedIcon = line.icon + ' '.repeat(symbolWidth === 1 ? 2 : 1);
    console.log(`  ${paddedIcon}${line.color(`${pad(line.label)} : ${line.value}`)}`);
  }

  if (summary.timeElapsed !== undefined) {
    const paddedIcon = '⏱'.padEnd(ICON_PAD, ' ');
    console.log(`  ${paddedIcon} ${chalk.blue(`${pad('Time')} : ${summary.timeElapsed.toFixed(2)}s`)}`);
  }
}

export async function runCodemod(ctx: WizardContext, name: string, fileName: string) {
  const spinner = ora(`Running codemod: ${name}`).start();

  const fullPath = path.join(CODESHIFT_DIR, fileName);
  if (!fs.existsSync(fullPath)) {
    spinner.fail(`Codemod file not found: ${fullPath}`);
    throw new Error(`Codemod file not found: ${fullPath}`);
  }

  try {
    const args = [
      '-t',
      fullPath,
      ctx.cwd, // target project path
      '--extensions',
      'ts,tsx',
      '--parser',
      'tsx',
      '--ignore-pattern',
      'node_modules|dist|build'
    ];

    const subprocess = await execa('npx', ['jscodeshift', ...args], {
      stdio: ['ignore', 'pipe', 'pipe'], // 👈 capture stdout + stderr
      reject: false // 👈 do NOT auto-throw
    });

    const { stdout, exitCode, stderr } = subprocess;
    // console.log(stdout);

    // Parse the summary block
    const summaryLines =
      stdout
        ?.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('Results:') || /errors|unmodified|skipped|ok|Time elapsed/i.test(line)) ?? [];

    const summary: CodemodSummary = { errors: 0, unmodified: 0, skipped: 0, ok: 0 };

    for (const line of summaryLines) {
      const countMatch = line.match(/(\d+)\s*(errors|unmodified|skipped|ok)/i);
      if (countMatch) {
        const [, count, key] = countMatch;
        summary[key.toLowerCase() as keyof CodemodSummary] = parseInt(count, 10);
      }

      const timeMatch = line.match(/Time elapsed:\s*([\d.]+)s/i);
      if (timeMatch) {
        summary.timeElapsed = parseFloat(timeMatch[1]);
      }
    }

    // Store structured result in context
    ctx.results.codemods ||= {};
    ctx.results.codemods[name] = {
      status: exitCode === 0 ? 'success' : 'failed',
      summary
    };

    // Finish spinner
    if (exitCode === 0) spinner.succeed(`Codemod ${name} completed successfully`);
    else spinner.fail(`Codemod ${name} failed`);

    // Print summary immediately
    printCodemodStepSummary(ctx.results.codemods[name]);

    if (exitCode !== 0) {
      if (stderr) console.error(stderr);
      throw new Error(`Codemod ${name} failed`);
    }
  } catch (err: any) {
    spinner.fail(`Codemod ${name} failed`);
    ctx.results.codemods ||= {};
    ctx.results.codemods[name] = { status: 'failed', summary: undefined };
    throw err;
  }
}
