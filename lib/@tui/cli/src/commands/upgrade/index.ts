/* eslint-disable no-console */
import chalk from 'chalk';
import { addModules } from './steps/addModules';
import { commitStep } from './steps/commit';
import { confirmProjectPath } from './steps/confirmProjectPath';
import { createBranch } from './steps/createBranch';
import { detectFramework } from './steps/detectFramework';
import { installDeps } from './steps/installDeps';
import { installPnpm } from './steps/installPnpm';
import { preflight } from './steps/preflight';
import { prepPackageJson } from './steps/preparePackageJson';
import { prepareRepo } from './steps/prepareRepo';
import { registerModuleI18n } from './steps/registerModuleI18n';
import { runCodemods } from './steps/runCodemods';
import { selectAdditionalModules } from './steps/selectAdditionalModules';
import type { StepKind, WizardContext, WizardStep } from './types';

const STEP_STYLE: Record<StepKind, { icon: string; color: (text: string) => string }> = {
  prep: { icon: '▶', color: chalk.cyan },
  mutate: { icon: '▶', color: chalk.yellow },
  commit: { icon: '▶', color: chalk.green }
};

const steps: WizardStep[] = [
  confirmProjectPath,
  preflight,
  installPnpm,
  createBranch,
  detectFramework,
  prepareRepo,
  commitStep('@tui/cli [upgrade] - 1: prepared repo'),
  selectAdditionalModules,
  addModules,
  commitStep('@tui/cli [upgrade] - 2: added @tui modules'),
  prepPackageJson,
  commitStep('@tui/cli [upgrade] - 3: updated package.json'),
  runCodemods,
  commitStep('@tui/cli [upgrade] - 4: codemods(fixing imports)'),
  registerModuleI18n,
  commitStep('@tui/cli [upgrade] - 5: registered @tui i18n resources'),
  installDeps,
  commitStep('@tui/cli [upgrade] - 6: pnpm install')
];

const runStep = async (step: WizardStep, ctx: WizardContext, index: number) => {
  console.log();

  if (step.skipIf?.(ctx)) {
    console.log(chalk.dim(`↷ [${index + 1}] Skipped: ${step.label}`));
    return;
  }

  const { icon, color } = STEP_STYLE[step.kind];

  console.log(color(icon), chalk.dim(`[${index + 1}]`), chalk.bold(step.label));

  const start = Date.now();
  await step.fn(ctx);
  const duration = Date.now() - start;

  console.log(chalk.dim(`↳ done in ${duration}ms`));
};

export const upgrade = async (options: { yes?: boolean; dryRun?: boolean }) => {
  const ctx: WizardContext = {
    cwd: process.cwd(),
    originalCwd: process.cwd(),
    results: { codemods: {}, defaultTuiVersion: '^4.0.0' },
    flags: options
  };

  for (let i = 0; i < steps.length; i++) {
    await runStep(steps[i], ctx, i);
  }

  console.log();
  console.log(chalk.green.bold('✔ Upgrade complete!'));
  console.log();
  console.log(chalk.yellow('⚠ Manual changes are likely required.'));
  console.log(
    chalk.yellow(
      '  Consult the upgrade guide for more details: https://github.com/CybercentreCanada/template-ui/blob/main/docs/guides/upgrade-guide.md'
    )
  );
};
