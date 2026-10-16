import { applyPatches, current as currentImmer, original as originalImmer } from 'immer';
import { apply, current as currentMutative, original as originalMutative, rawReturn } from 'mutative';
import type {
  BenchDeep,
  BenchQuery,
  BenchRow,
  BenchState,
  BenchWorkload
} from 'routes/development-library/sections/store/benchmark.models';
import { BenchCounter, DEFAULT_BENCH_STATE } from 'routes/development-library/sections/store/benchmark.models';

const SMALL_ROWS = 100;
const LARGE_ROWS = 10_000;
const BIG_PROPERTIES = 1_000;
const DEEP_LEVELS = 10;
const RTK_UPDATES = 200;
const RTK_QUERIES = 20;

// Keeps the loops that only read from being optimized away.
let sink = 0;

const base = (patch: Partial<BenchState>): BenchState => ({ ...DEFAULT_BENCH_STATE, ...patch });

const makeRows = (count: number): BenchRow[] =>
  Array.from({ length: count }, (_, id) => ({ id, label: `row ${id}`, value: id }));

const makeRecords = (count: number): Record<number, BenchRow> =>
  Object.fromEntries(makeRows(count).map(row => [row.id, row]));

const makeBig = (count: number): Record<string, number> =>
  Object.fromEntries(Array.from({ length: count }, (_, index) => [`k${index}`, index]));

const makeNumbers = (count: number): number[] => Array.from({ length: count }, (_, index) => index);

const makeDeep = (levels: number): BenchDeep => ({ child: levels <= 1 ? null : makeDeep(levels - 1), value: 0 });

const makeQueries = (count: number): Record<string, BenchQuery> =>
  Object.fromEntries(Array.from({ length: count }, (_, index) => [`q${index}`, { data: 0, status: 'pending' }]));

const sumRows = (state: BenchState) => {
  let total = 0;
  // The index loop is the point of the workload.
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let index = 0; index < state.rows.length; index++) total += state.rows[index].value;
  sink = total;
};

const bumpDeep = (node: BenchDeep, depth: number): BenchDeep =>
  depth === 0 ? { ...node, value: node.value + 1 } : { ...node, child: bumpDeep(node.child, depth - 1) };

// Built while a workload is prepared, so that building it is not measured.
let replacementState: BenchState = DEFAULT_BENCH_STATE;
let rowPatches: { op: 'replace'; path: (string | number)[]; value: number }[] = [];

export const BENCH_WORKLOADS: BenchWorkload[] = [
  {
    id: 'small-field',
    initial: () => base({ small: { a: 1, b: 2, c: 'x' } }),
    label: 'Update one field of a small object',
    rows: null,
    run: ({ update }) =>
      update({
        draft: d => {
          d.small.a += 1;
        },
        immutable: s => ({ ...s, small: { ...s.small, a: s.small.a + 1 } })
      })
  },
  {
    id: 'array-item-by-id',
    initial: () => base({ rows: makeRows(SMALL_ROWS) }),
    label: 'Update an array item found by ID',
    rows: SMALL_ROWS,
    run: ({ update }) =>
      update({
        draft: d => {
          const row = d.rows.find(r => r.id === SMALL_ROWS / 2);
          if (row) row.value += 1;
        },
        immutable: s => ({
          ...s,
          rows: s.rows.map(r => (r.id === SMALL_ROWS / 2 ? { ...r, value: r.value + 1 } : r))
        })
      })
  },
  {
    id: 'rtk-updates',
    initial: () => base({ rtk: makeQueries(RTK_QUERIES) }),
    label: `${RTK_UPDATES} RTK Query-style updates`,
    rows: null,
    run: ({ update }) => {
      for (let index = 0; index < RTK_UPDATES; index++) {
        const key = `q${index % RTK_QUERIES}`;

        update({
          draft: d => {
            d.rtk[key].status = 'fulfilled';
            d.rtk[key].data = index;
          },
          immutable: s => ({ ...s, rtk: { ...s.rtk, [key]: { ...s.rtk[key], data: index, status: 'fulfilled' } } })
        });
      }
    }
  },
  {
    id: 'read-rows',
    initial: () => base({ rows: makeRows(LARGE_ROWS) }),
    label: 'Read every row by index',
    rows: LARGE_ROWS,
    run: ({ update }) =>
      update({
        draft: d => {
          sumRows(d);
        },
        immutable: s => {
          sumRows(s);
          return s;
        }
      })
  },
  {
    id: 'remove-first-row',
    initial: () => base({ rows: makeRows(LARGE_ROWS) }),
    label: 'Remove the first row',
    rows: LARGE_ROWS,
    run: ({ update }) =>
      update({
        draft: d => {
          d.rows.shift();
        },
        immutable: s => ({ ...s, rows: s.rows.slice(1) })
      })
  },
  {
    id: 'update-every-row',
    initial: () => base({ rows: makeRows(LARGE_ROWS) }),
    label: 'Update every row',
    rows: LARGE_ROWS,
    run: ({ update }) =>
      update({
        draft: d => {
          for (const row of d.rows) row.value += 1;
        },
        immutable: s => ({ ...s, rows: s.rows.map(row => ({ ...row, value: row.value + 1 })) })
      })
  },
  {
    id: 'update-one-record',
    initial: () => base({ records: makeRecords(LARGE_ROWS) }),
    label: 'Update one of 10,000 records',
    rows: LARGE_ROWS,
    run: ({ update }) =>
      update({
        draft: d => {
          d.records[LARGE_ROWS / 2].value += 1;
        },
        immutable: s => ({
          ...s,
          records: {
            ...s.records,
            [LARGE_ROWS / 2]: { ...s.records[LARGE_ROWS / 2], value: s.records[LARGE_ROWS / 2].value + 1 }
          }
        })
      })
  },
  {
    id: 'insert-property',
    initial: () => base({ big: makeBig(BIG_PROPERTIES) }),
    label: 'Insert into a 1,000-property object',
    rows: null,
    run: ({ update }) =>
      update({
        draft: d => {
          d.big.extra = 1;
        },
        immutable: s => ({ ...s, big: { ...s.big, extra: 1 } })
      })
  },
  {
    id: 'map-value',
    initial: () => base({ map: new Map(makeNumbers(LARGE_ROWS).map(n => [n, n])) }),
    label: 'Update a Map value',
    rows: LARGE_ROWS,
    run: ({ update }) =>
      update({
        draft: d => {
          d.map.set(LARGE_ROWS / 2, (d.map.get(LARGE_ROWS / 2) ?? 0) + 1);
        },
        immutable: s => {
          const map = new Map(s.map);
          map.set(LARGE_ROWS / 2, (map.get(LARGE_ROWS / 2) ?? 0) + 1);
          return { ...s, map };
        }
      })
  },
  {
    id: 'set-add',
    initial: () => base({ set: new Set(makeNumbers(LARGE_ROWS)) }),
    label: 'Add a number to a Set',
    rows: LARGE_ROWS,
    run: ({ update }) =>
      update({
        draft: d => {
          d.set.add(-1);
        },
        immutable: s => {
          const set = new Set(s.set);
          set.add(-1);
          return { ...s, set };
        }
      })
  },
  {
    id: 'class-instance',
    initial: () => base({ instances: makeNumbers(LARGE_ROWS).map(n => new BenchCounter(n)) }),
    label: 'Update a class instance',
    rows: LARGE_ROWS,
    run: ({ update }) =>
      update({
        draft: d => {
          d.instances[LARGE_ROWS / 2].count += 1;
        },
        immutable: s => ({
          ...s,
          instances: s.instances.map((c, index) => (index === LARGE_ROWS / 2 ? c.withCount(c.count + 1) : c))
        })
      })
  },
  {
    id: 'deep-value',
    initial: () => base({ deep: makeDeep(DEEP_LEVELS) }),
    label: 'Update a value ten levels deep',
    rows: null,
    run: ({ update }) =>
      update({
        draft: d => {
          let node = d.deep;
          for (let level = 1; level < DEEP_LEVELS; level++) node = node.child;
          node.value += 1;
        },
        immutable: s => ({ ...s, deep: bumpDeep(s.deep, DEEP_LEVELS - 1) })
      })
  },
  {
    id: 'apply-patches',
    initial: () => {
      rowPatches = Array.from({ length: LARGE_ROWS / 10 }, (_, index) => ({
        op: 'replace' as const,
        path: ['rows', index * 10, 'value'],
        value: -1
      }));

      return base({ rows: makeRows(LARGE_ROWS) });
    },
    label: 'Apply patches to 10% of rows',
    rows: LARGE_ROWS,
    run: ({ update }) =>
      update({
        immer: d => applyPatches(originalImmer(d), rowPatches),
        mutative: d => apply(originalMutative(d), rowPatches)
      })
  },
  {
    id: 'current-after-shift',
    initial: () => base({ rows: makeRows(LARGE_ROWS) }),
    label: 'Search current() after shift()',
    rows: LARGE_ROWS,
    run: ({ update }) =>
      update({
        immer: d => {
          d.rows.shift();
          sink = currentImmer(d.rows).findIndex(row => row.id === -1);
        },
        immutable: s => {
          const rows = s.rows.slice(1);
          sink = rows.findIndex(row => row.id === -1);
          return { ...s, rows };
        },
        mutative: d => {
          d.rows.shift();
          sink = currentMutative(d.rows).findIndex(row => row.id === -1);
        }
      })
  },
  {
    id: 'filter-draft',
    initial: () => base({ rows: makeRows(LARGE_ROWS) }),
    label: 'Return draft.filter()',
    rows: LARGE_ROWS,
    run: ({ update }) =>
      update({
        draft: d => {
          d.rows = d.rows.filter(row => row.id % 2 === 0);
        },
        immutable: s => ({ ...s, rows: s.rows.filter(row => row.id % 2 === 0) })
      })
  },
  {
    id: 'return-new-state',
    initial: () => {
      replacementState = base({ rows: makeRows(LARGE_ROWS) });
      return base({ rows: makeRows(LARGE_ROWS) });
    },
    label: 'Return a new state',
    rows: LARGE_ROWS,
    run: ({ update }) =>
      update({
        draft: () => replacementState,
        immutable: () => replacementState
      })
  },
  {
    id: 'return-raw',
    initial: () => {
      replacementState = base({ rows: makeRows(LARGE_ROWS) });
      return base({ rows: makeRows(LARGE_ROWS) });
    },
    label: 'Return it with rawReturn()',
    rows: LARGE_ROWS,
    run: ({ update }) =>
      update({
        immer: () => replacementState,
        immutable: () => replacementState,
        mutative: () => rawReturn(replacementState)
      })
  }
];

/** Last value the read-only loops produced; exported so the loops are observable. */
export const getBenchSink = (): number => sink;
