export type CodemodSummary = {
  errors: number;
  unmodified: number;
  skipped: number;
  ok: number;
  timeElapsed?: number; // seconds
};

export type CodemodStatus = {
  status: 'success' | 'skipped' | 'failed';
  summary?: CodemodSummary;
};

export interface WizardContext {
  cwd: string;
  originalCwd: string;

  framework?: Framework;
  packageJson?: any;

  git?: {
    isRepo: boolean;
    clean?: boolean;
  };

  flags: {
    yes?: boolean;
    dryRun?: boolean;
    noInstall?: boolean;
  };

  results: {
    pnpmVersion?: string;
    pnpmInstalled?: boolean;
    codemods: Record<string, CodemodStatus>;
    additionalModules?: { name: string; version?: string }[];
    defaultTuiVersion?: string;
    referenceRepoPath?: string;
    codemodLogs?: Record<string, string>; // optional: logs/output per codemod
  };
}

export type StepKind = 'prep' | 'mutate' | 'commit';

export interface WizardStep {
  label: string;
  kind: StepKind;
  fn: (ctx: WizardContext) => Promise<void>;
  skipIf?: (ctx: WizardContext) => boolean;
}

export type Framework = 'remix-tui' | 'template-ui';
