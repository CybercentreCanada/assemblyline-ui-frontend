import { alpha, type Theme } from '@mui/material';
import type {
  SandboxBody as SandboxData,
  SandboxProcessItem,
  SandboxSignatureItem
} from 'components/models/base/result_body';
import type { PossibleColor } from 'helpers/colors';

export const INTEGRITY_LEVEL_COLOR_MAP: Record<string, PossibleColor> = {
  system: 'primary',
  high: 'success',
  medium: 'warning',
  low: 'error'
};

export type ProcessItem = SandboxProcessItem & {
  children?: ProcessItem[];
};

export type SandboxFilter = SandboxProcessItem;

/* ----------------------------------------------------------------------------
 * Build hierarchical process tree from a flat process list
 * -------------------------------------------------------------------------- */
export const buildProcessTree = (processes: SandboxProcessItem[]): ProcessItem[] => {
  const map = new Map<number, ProcessItem>();
  const roots: ProcessItem[] = [];

  for (const proc of processes) {
    map.set(proc.pid, { ...proc, children: [] });
  }

  for (const proc of map.values()) {
    const parent = map.get(proc.ppid);
    if (parent) parent.children.push(proc);
    else roots.push(proc);
  }

  return roots;
};

/* ----------------------------------------------------------------------------
 * Compute score for a process
 * -------------------------------------------------------------------------- */
export const getProcessScore = (
  process: SandboxProcessItem,
  signatures: readonly SandboxSignatureItem[]
): number | null => {
  if (!process?.pid) return null;
  if (process.safelisted) return 0;

  let total = 0;
  let matched = false;

  for (const sig of signatures) {
    if (sig.pids?.includes(process.pid)) {
      matched = true;
      total += typeof sig.score === 'number' ? sig.score : 0;
    }
  }

  return matched ? total : 0;
};

/* ----------------------------------------------------------------------------
 * Collect all descendant PIDs recursively
 * -------------------------------------------------------------------------- */
export const getDescendantPids = (root: SandboxProcessItem, processes: readonly SandboxProcessItem[]): number[] => {
  if (!root?.pid) return [];

  const descendants: number[] = [];
  const stack: number[] = [root.pid];

  while (stack.length) {
    const parentPid = stack.pop();
    for (const child of processes) {
      if (child.ppid === parentPid) {
        descendants.push(child.pid);
        stack.push(child.pid);
      }
    }
  }

  return descendants;
};

/* ----------------------------------------------------------------------------
 * Compute highest heuristic score among process and descendants
 * -------------------------------------------------------------------------- */
export const getHighestProcessScore = (item: SandboxProcessItem, body: SandboxData): number | undefined => {
  const initialScore = getProcessScore(item, body.signatures);
  if (!item.pid) return initialScore ?? undefined;

  const descendantPids = getDescendantPids(item, body.processes);
  const relevant = body.processes.filter(p => p.pid === item.pid || descendantPids.includes(p.pid));

  let maxScore: number | undefined = initialScore ?? undefined;

  for (const proc of relevant) {
    if (proc.safelisted) continue;
    const score = getProcessScore(proc, body.signatures);
    if (typeof score === 'number') {
      maxScore = maxScore === undefined ? score : Math.max(maxScore, score);
    }
  }

  return maxScore;
};

/* ----------------------------------------------------------------------------
 * Compute background color based on heuristic verdict
 * -------------------------------------------------------------------------- */
export const getBackgroundColor = (
  theme: Theme,
  scoreToVerdict: (score: number) => string,
  score: number | undefined,
  opacity = 0.2
): string | null => {
  const paletteMode = theme.palette.mode;

  if (score === undefined) {
    const base = theme.palette.success[paletteMode === 'dark' ? 'dark' : 'light'];
    return alpha(base, opacity);
  }

  const verdict = scoreToVerdict(score);
  const colorMap: Record<string, string | null> = {
    malicious: theme.palette.error[paletteMode === 'dark' ? 'dark' : 'light'],
    highly_suspicious: theme.palette.warning[paletteMode === 'dark' ? 'dark' : 'light'],
    suspicious: theme.palette.warning[paletteMode === 'dark' ? 'dark' : 'light'],
    info: theme.palette.grey[800],
    safe: theme.palette.success[paletteMode === 'dark' ? 'dark' : 'light']
  };

  const baseColor = colorMap[verdict] ?? null;
  return baseColor ? alpha(baseColor, opacity) : null;
};

// ──────────────────────────────────────────────────────────────
// IP comparison helper
// ──────────────────────────────────────────────────────────────
export const compareIPs = (ipA: string, ipB: string): number => {
  const aParts = ipA.split(/[.:]/).map(Number);
  const bParts = ipB.split(/[.:]/).map(Number);
  const len = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < len; i++) {
    const diff = (aParts[i] || 0) - (bParts[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
};
