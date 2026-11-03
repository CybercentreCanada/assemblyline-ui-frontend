import { immerable } from 'immer';

/** Class instance used to benchmark updates of values that are not plain objects. */
export class BenchCounter {
  [immerable] = true;

  count: number;

  constructor(count: number) {
    this.count = count;
  }

  withCount(count: number): BenchCounter {
    return new BenchCounter(count);
  }
}

/** A row of the tables used by the benchmark workloads. */
export type BenchRow = {
  /** Unique identifier of the row. */
  id: number;
  /** Text displayed for the row. */
  label: string;
  /** Number that the workloads update. */
  value: number;
};

/** A node of the chain used to benchmark deeply nested updates. */
export type BenchDeep = {
  /** Next node of the chain, `null` on the last one. */
  child: BenchDeep | null;
  /** Number that the workloads update. */
  value: number;
};

/** A cache entry shaped like an RTK Query request. */
export type BenchQuery = {
  /** Last received payload. */
  data: number;
  /** Request status. */
  status: string;
};

/** State shared by every benchmark workload; each workload only fills what it needs. */
export type BenchState = {
  /** Object with many properties. */
  big: Record<string, number>;
  /** Chain of nested objects. */
  deep: BenchDeep;
  /** Class instances. */
  instances: BenchCounter[];
  /** Map of numbers. */
  map: Map<number, number>;
  /** Records keyed by their id. */
  records: Record<number, BenchRow>;
  /** Array of rows. */
  rows: BenchRow[];
  /** RTK Query style cache entries. */
  rtk: Record<string, BenchQuery>;
  /** Set of numbers. */
  set: Set<number>;
  /** Small object. */
  small: { a: number; b: number; c: string };
};

export const DEFAULT_BENCH_STATE: BenchState = {
  big: {},
  deep: { child: null, value: 0 },
  instances: [],
  map: new Map<number, number>(),
  records: {},
  rows: [],
  rtk: {},
  set: new Set<number>(),
  small: { a: 0, b: 0, c: '' }
};

/** Recipe that returns the next state without touching the previous one. */
export type BenchImmutableRecipe = (state: BenchState) => BenchState;

/** Recipe that mutates a draft, or returns a replacement state. */
// A recipe that only mutates returns nothing, which `undefined` does not accept for block-bodied arrows.
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type BenchDraftRecipe = (draft: BenchState) => BenchState | void;

/** The ways a workload can express one update; a store runs the first one it supports. */
export type BenchRecipes = {
  /** Draft recipe shared by immer and mutative. */
  draft?: BenchDraftRecipe;
  /** Draft recipe that only works with immer. */
  immer?: BenchDraftRecipe;
  /** Hand-written immutable recipe. */
  immutable?: BenchImmutableRecipe;
  /** Draft recipe that only works with mutative. */
  mutative?: BenchDraftRecipe;
};

/** What a workload can do to the store it runs against. */
export type BenchContext = {
  /** Returns the current state. */
  read: () => BenchState;
  /** Applies one update. */
  update: (recipes: BenchRecipes) => void;
};

/** A store prepared for one benchmark run. */
export type BenchHandle = BenchContext & {
  /** Releases anything the store holds. */
  dispose: () => void;
  /** Puts the store back to its initial state. */
  reset: () => void;
};

/** One store implementation that can be benchmarked. */
export type BenchAdapter = {
  /** Creates the store with `initial` as its state. */
  create: (initial: BenchState) => BenchHandle;
  /** Stable identifier. */
  id: string;
  /** Column title. */
  label: string;
};

/** One operation measured against every store. */
export type BenchWorkload = {
  /** Stable identifier. */
  id: string;
  /** Builds a fresh initial state. */
  initial: () => BenchState;
  /** Row title. */
  label: string;
  /** Number of rows, when the workload has a size. */
  rows: number | null;
  /** The measured operation. */
  run: (context: BenchContext) => void;
};

/** Outcome of one workload on one store. */
export type BenchResult =
  | { kind: 'ok'; ms: number; runs: number }
  | { kind: 'unsupported' }
  | { kind: 'error'; message: string };
