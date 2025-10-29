import type { SandboxProcessItem } from 'components/models/base/result_body';

export type ProcessItem = SandboxProcessItem & {
  children?: ProcessItem[];
};

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
