import { runCodemod } from '../codemods';
import type { WizardContext, WizardStep } from '../types';

const PROGRAMS: Record<string, string> = {
  rewrite_imports: 'rewrite-imports.cjs',
  merge_imports: 'merge_imports.js',
  fix_react_router_dom_imports: 'fix_react_router_dom_imports.js'
};

export const runCodemods: WizardStep = {
  kind: 'mutate',
  label: 'Run codemods (import fixes)',
  fn: async (ctx: WizardContext) => {
    for (const [name, file] of Object.entries(PROGRAMS)) {
      await runCodemod(ctx, name, file);
    }
  }
};
