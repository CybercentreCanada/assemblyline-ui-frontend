import type { Theme } from '@mui/material';
import { alpha } from '@mui/material';
import type {
  SandboxBody as SandboxData,
  SandboxHeuristicItem,
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

/* ----------------------------------------------------------------------------
 * Build hierarchical process tree from a flat process list
 * -------------------------------------------------------------------------- */
export const buildProcessTree = (processes: ProcessItem[]): ProcessItem[] => {
  const map = new Map<number, ProcessItem>();
  for (const proc of processes) map.set(proc.pid, { ...proc, children: [] });
  const roots: ProcessItem[] = [];
  for (const proc of map.values()) {
    if (proc.ppid === 0 || !map.has(proc.ppid)) roots.push(proc);
    else map.get(proc.ppid).children.push(proc);
  }
  return roots;
};

/* ----------------------------------------------------------------------------
 * Compute heuristic score for a process
 * -------------------------------------------------------------------------- */
export const getProcessHeuristicScore = (
  process: SandboxProcessItem,
  signatures: SandboxSignatureItem[],
  heuristics: SandboxHeuristicItem[] = []
): number | null => {
  if (!process.pid) return null;
  if (process.safelisted) return 0;

  const matching = signatures.filter(sig => sig.pid === process.pid && sig.heuristic);
  if (matching.length === 0) return null;

  let maxScore = -Infinity;

  for (const sig of matching) {
    const heur = heuristics.find(h => h.heur_id === sig.heuristic);
    if (heur && heur.score > maxScore) maxScore = heur.score;
  }

  return maxScore === -Infinity ? null : maxScore;
};

/* ----------------------------------------------------------------------------
 * Collect all descendant PIDs recursively
 * -------------------------------------------------------------------------- */
export const getDescendantPids = (root: SandboxProcessItem, processes: SandboxProcessItem[]): number[] => {
  if (!root.pid) return [];
  const stack = [root.pid];
  const descendants: number[] = [];

  while (stack.length) {
    const parent = stack.pop();
    const children = processes.filter(p => p.ppid === parent);
    for (const child of children) {
      descendants.push(child.pid);
      stack.push(child.pid);
    }
  }
  return descendants;
};

/* ----------------------------------------------------------------------------
 * Compute highest heuristic score among process and descendants
 * -------------------------------------------------------------------------- */
export const getHighestProcessScore = (item: SandboxProcessItem, body: SandboxData): number | undefined => {
  const processScore = getProcessHeuristicScore(item, body.signatures, body.heuristics);
  if (!item.pid) return processScore ?? undefined;

  const descendantPids = getDescendantPids(item, body.processes);
  const relevant = body.processes.filter(p => p.pid === item.pid || descendantPids.includes(p.pid));

  let maxScore = -Infinity;

  for (const proc of relevant) {
    if (proc.safelisted) continue;
    const score = getProcessHeuristicScore(proc, body.signatures, body.heuristics);
    if (typeof score === 'number' && score > maxScore) maxScore = score;
  }

  return maxScore === -Infinity ? undefined : maxScore;
};

/* ----------------------------------------------------------------------------
 * Compute background color based on heuristic verdict
 * -------------------------------------------------------------------------- */
export const getBackgroundColor = (
  theme: Theme,
  scoreToVerdict: (score: number) => string,
  score: number | undefined,
  opacity: number
): string | null => {
  if (score === undefined) {
    return alpha(theme.palette.success[theme.palette.mode === 'dark' ? 'dark' : 'light'], opacity);
  }

  const verdict = scoreToVerdict(score);
  const colorMap: Record<string, string | null> = {
    malicious: theme.palette.error[theme.palette.mode === 'dark' ? 'dark' : 'light'],
    highly_suspicious: theme.palette.warning[theme.palette.mode === 'dark' ? 'dark' : 'light'],
    suspicious: theme.palette.warning[theme.palette.mode === 'dark' ? 'dark' : 'light'],
    info: theme.palette.grey[800],
    safe: theme.palette.success[theme.palette.mode === 'dark' ? 'dark' : 'light']
  };

  const baseColor = colorMap[verdict] ?? null;
  return baseColor ? alpha(baseColor, opacity) : null;
};
