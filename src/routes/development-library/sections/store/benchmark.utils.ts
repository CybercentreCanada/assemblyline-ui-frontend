import type {
  BenchAdapter,
  BenchResult,
  BenchWorkload
} from 'routes/development-library/sections/store/benchmark.models';

/** Time spent on one workload and store, in milliseconds, before the mean is taken. */
export const BENCH_BUDGET_MS = 150;

/** Upper bound on how many times a fast workload is repeated. */
export const BENCH_MAX_RUNS = 200;

/** Thrown by a store that has no way to express a workload. */
export class BenchUnsupportedError extends Error {
  constructor() {
    super('Not supported by this store');
  }
}

/**
 * @name measureWorkload
 * @description Runs a workload against a fresh store until the time budget is spent. The store is reset before
 *              every run and the reset is not timed. A slow workload runs once.
 * @param adapter - Store implementation to measure
 * @param workload - Operation to measure
 * @returns Mean milliseconds per run, or why there is no measurement
 */
export const measureWorkload = (adapter: BenchAdapter, workload: BenchWorkload): BenchResult => {
  let handle: ReturnType<BenchAdapter['create']> | null = null;

  try {
    handle = adapter.create(workload.initial());

    let total = 0;
    let runs = 0;

    do {
      handle.reset();

      const start = performance.now();
      workload.run(handle);
      total += performance.now() - start;
      runs += 1;
    } while (total < BENCH_BUDGET_MS && runs < BENCH_MAX_RUNS);

    return { kind: 'ok', ms: total / runs, runs };
  } catch (error) {
    if (error instanceof BenchUnsupportedError) return { kind: 'unsupported' };
    return { kind: 'error', message: error instanceof Error ? error.message : String(error) };
  } finally {
    handle?.dispose();
  }
};

export type RunBenchmarksOptions = {
  /** Stores to measure, one table column each. */
  adapters: BenchAdapter[];
  /** Called with every finished measurement. */
  onResult: (workloadId: string, adapterId: string, result: BenchResult) => void;
  /** Checked before each measurement; return `true` to stop. */
  shouldStop: () => boolean;
  /** Operations to measure, one table row each. */
  workloads: BenchWorkload[];
};

/**
 * @name runBenchmarks
 * @description Measures every workload on every store, one at a time, yielding to the event loop in between so the
 *              page can repaint its progress.
 * @param options - What to measure and how to report it
 */
export const runBenchmarks = async ({ adapters, onResult, shouldStop, workloads }: RunBenchmarksOptions) => {
  for (const workload of workloads) {
    for (const adapter of adapters) {
      if (shouldStop()) return;

      await new Promise<void>(resolve => setTimeout(resolve, 0));

      onResult(workload.id, adapter.id, measureWorkload(adapter, workload));
    }
  }
};
