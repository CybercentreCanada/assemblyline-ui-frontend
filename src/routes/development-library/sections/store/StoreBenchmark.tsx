import { Typography, useTheme } from '@mui/material';
import { createAppStore, createStoreContext } from 'features/store';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BenchAccess } from 'routes/development-library/sections/store/benchmark.adapters';
import { createBenchAdapters } from 'routes/development-library/sections/store/benchmark.adapters';
import type { BenchResult, BenchState } from 'routes/development-library/sections/store/benchmark.models';
import { DEFAULT_BENCH_STATE } from 'routes/development-library/sections/store/benchmark.models';
import { runBenchmarks } from 'routes/development-library/sections/store/benchmark.utils';
import { BENCH_WORKLOADS } from 'routes/development-library/sections/store/benchmark.workloads';
import { Button } from 'ui/buttons/Button';
import { PageSection } from 'ui/layouts/PageSection';

const {
  StoreProvider: AppStoreProvider,
  useSetStore: useAppSetStore,
  useStoreApi: useAppStoreApi
} = createAppStore<BenchState>(DEFAULT_BENCH_STATE);

const { StoreProvider: ContextStoreProvider, useStore: useContextStore } =
  createStoreContext<BenchState>(DEFAULT_BENCH_STATE);

const formatMs = (ms: number): string => (ms >= 100 ? ms.toFixed(0) : ms >= 1 ? ms.toFixed(2) : ms.toFixed(3));

const formatMultiplier = (ms: number, fastest: number): string => {
  const multiplier = fastest > 0 ? ms / fastest : 1;
  return `${multiplier >= 100 ? Math.round(multiplier).toLocaleString() : multiplier.toFixed(2)}x`;
};

type BenchView = 'ms' | 'multiplier';

// Averaging logs suits ratios and stops a few extreme rows from dominating.
const geometricMean = (values: number[]): number | null =>
  values.length === 0 ? null : Math.exp(values.reduce((sum, value) => sum + Math.log(value), 0) / values.length);

// Log scale keeps a 3x gap visible next to a 1000x one; hue runs green (120) to yellow (60) to red (0).
const gradientColor = (ms: number, fastest: number, slowest: number, dark: boolean): string => {
  const position = slowest > fastest && fastest > 0 ? Math.log(ms / fastest) / Math.log(slowest / fastest) : 0;
  return `hsl(${Math.round(120 * (1 - position))}, 75%, ${dark ? 60 : 36}%)`;
};

//*****************************************************************************************
// Store Benchmark Captures
//*****************************************************************************************

type CaptureProps = {
  /** Called once the store is mounted, with synchronous access to it. */
  onReady: (access: BenchAccess) => void;
};

const AppStoreCapture = memo(({ onReady }: CaptureProps) => {
  const api = useAppStoreApi();
  const setStore = useAppSetStore();

  useEffect(() => {
    onReady({ read: () => api.getState(), write: recipe => setStore(prev => recipe(prev)) });
  }, [api, onReady, setStore]);

  return null;
});

AppStoreCapture.displayName = 'AppStoreCapture';

const ContextStoreCapture = memo(({ onReady }: CaptureProps) => {
  const [, set] = useContextStore(() => null);

  useEffect(() => {
    onReady({
      // The store has no getter, so the current state is read through an updater that changes nothing.
      read: () => {
        let current = DEFAULT_BENCH_STATE;
        set(state => {
          current = state as BenchState;
          return {};
        });
        return current;
      },
      write: recipe => set(state => recipe(state as BenchState))
    });
  }, [onReady, set]);

  return null;
});

ContextStoreCapture.displayName = 'ContextStoreCapture';

//*****************************************************************************************
// Store Benchmark
//*****************************************************************************************

export const StoreBenchmark = memo(() => {
  const theme = useTheme();

  const appStoreRef = useRef<BenchAccess | null>(null);
  const contextStoreRef = useRef<BenchAccess | null>(null);
  const stopRef = useRef<boolean>(false);

  const [results, setResults] = useState<Record<string, BenchResult>>({});
  const [running, setRunning] = useState<boolean>(false);
  const [view, setView] = useState<BenchView>('ms');
  const [sorted, setSorted] = useState<boolean>(false);

  const adapters = useMemo(
    () => createBenchAdapters({ appStore: () => appStoreRef.current, contextStore: () => contextStoreRef.current }),
    []
  );

  const total = adapters.length * BENCH_WORKLOADS.length;
  const done = Object.keys(results).length;

  const rows = useMemo(
    () =>
      BENCH_WORKLOADS.map(workload => {
        const cells = adapters.map(adapter => ({ adapter, result: results[`${workload.id}:${adapter.id}`] }));
        const times = cells.flatMap(({ result }) => (result?.kind === 'ok' ? [result.ms] : []));
        const fastest = Math.min(...times);
        const slowest = Math.max(...times);

        return { cells, fastest, slowest, workload };
      }),
    [adapters, results]
  );

  // Geometric mean of each store's per-row multipliers, skipping rows where it has no result.
  const means = useMemo(
    () =>
      adapters.map((_, index) => {
        const multipliers = rows.flatMap(({ cells, fastest }) => {
          const result = cells[index].result;
          return result?.kind === 'ok' && fastest > 0 ? [result.ms / fastest] : [];
        });

        return geometricMean(multipliers);
      }),
    [adapters, rows]
  );

  const order = useMemo(() => {
    const indexes = adapters.map((_, index) => index);
    if (!sorted) return indexes;

    return indexes.sort((a, b) => (means[a] ?? Infinity) - (means[b] ?? Infinity));
  }, [adapters, means, sorted]);

  const meanRange = useMemo(() => {
    const values = means.filter((value): value is number => value !== null);
    return { fastest: Math.min(...values), slowest: Math.max(...values) };
  }, [means]);

  const handleAppStoreReady = useCallback((access: BenchAccess) => {
    appStoreRef.current = access;
  }, []);

  const handleContextStoreReady = useCallback((access: BenchAccess) => {
    contextStoreRef.current = access;
  }, []);

  const handleRun = useCallback(async () => {
    stopRef.current = false;
    setResults({});
    setRunning(true);

    await runBenchmarks({
      adapters,
      onResult: (workloadId, adapterId, result) =>
        setResults(prev => ({ ...prev, [`${workloadId}:${adapterId}`]: result })),
      shouldStop: () => stopRef.current,
      workloads: BENCH_WORKLOADS
    });

    setRunning(false);
  }, [adapters]);

  const handleStop = useCallback(() => {
    stopRef.current = true;
  }, []);

  const handleToggleView = useCallback(() => {
    setView(prev => (prev === 'ms' ? 'multiplier' : 'ms'));
  }, []);

  const handleToggleSort = useCallback(() => {
    setSorted(prev => !prev);
  }, []);

  const dark = theme.palette.mode === 'dark';
  const cellStyle = { borderBottom: `1px solid ${theme.palette.divider}`, padding: theme.spacing(0.75, 1) };

  return (
    <PageSection
      primary="benchmarks"
      secondary={`${
        view === 'ms'
          ? 'Mean milliseconds per operation'
          : 'Time relative to the fastest store in each row, where 1.00x is the fastest'
      }, lower is better. A slow cell runs once and blocks the page while it does.`}
      anchor
    >
      <AppStoreProvider>
        <AppStoreCapture onReady={handleAppStoreReady} />
      </AppStoreProvider>
      <ContextStoreProvider data={DEFAULT_BENCH_STATE}>
        <ContextStoreCapture onReady={handleContextStoreReady} />
      </ContextStoreProvider>

      <div style={{ alignItems: 'center', display: 'flex', gap: theme.spacing(2), paddingBottom: theme.spacing(2) }}>
        <Button id="store-benchmark-run" disabled={running} size="small" variant="contained" onClick={handleRun}>
          Run benchmarks
        </Button>
        <Button id="store-benchmark-stop" disabled={!running} size="small" variant="outlined" onClick={handleStop}>
          Stop
        </Button>
        <Button id="store-benchmark-view" size="small" variant="outlined" onClick={handleToggleView}>
          {view === 'ms' ? 'Show multipliers' : 'Show milliseconds'}
        </Button>
        <Button
          id="store-benchmark-sort"
          aria-pressed={sorted}
          size="small"
          variant="outlined"
          onClick={handleToggleSort}
        >
          {sorted ? 'Original order' : 'Sort by geometric mean'}
        </Button>
        <Typography aria-live="polite" color="textSecondary" variant="body2">
          {`${done} / ${total} measured`}
        </Typography>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th scope="col" style={{ ...cellStyle, textAlign: 'left' }}>
                Workload
              </th>
              <th scope="col" style={{ ...cellStyle, textAlign: 'right' }}>
                Rows
              </th>
              {order.map(index => (
                <th key={adapters[index].id} scope="col" style={{ ...cellStyle, textAlign: 'right' }}>
                  {adapters[index].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ cells, fastest, slowest, workload }) => (
              <tr key={workload.id}>
                <th scope="row" style={{ ...cellStyle, fontWeight: 'normal', textAlign: 'left' }}>
                  {workload.label}
                </th>
                <td style={{ ...cellStyle, textAlign: 'right' }}>{workload.rows?.toLocaleString() ?? '—'}</td>
                {order.map(index => {
                  const { adapter, result } = cells[index];

                  return (
                    <td
                      key={adapter.id}
                      title={
                        result?.kind === 'error'
                          ? result.message
                          : result?.kind === 'ok'
                            ? `${formatMs(result.ms)} ms, ${result.runs} runs`
                            : undefined
                      }
                      style={{
                        ...cellStyle,
                        color: result?.kind === 'ok' ? gradientColor(result.ms, fastest, slowest, dark) : undefined,
                        fontFamily: 'monospace',
                        fontWeight: result?.kind === 'ok' && result.ms === fastest ? 700 : 400,
                        textAlign: 'right'
                      }}
                    >
                      {result?.kind === 'ok'
                        ? view === 'ms'
                          ? formatMs(result.ms)
                          : formatMultiplier(result.ms, fastest)
                        : result?.kind === 'unsupported'
                          ? '—'
                          : result?.kind === 'error'
                            ? 'err'
                            : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={2} style={{ ...cellStyle, textAlign: 'left' }}>
                Geometric mean multiplier
              </th>
              {order.map(index => {
                const value = means[index];

                return (
                  <td
                    key={adapters[index].id}
                    style={{
                      ...cellStyle,
                      color:
                        value !== null ? gradientColor(value, meanRange.fastest, meanRange.slowest, dark) : undefined,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      textAlign: 'right'
                    }}
                  >
                    {value !== null ? formatMultiplier(value, 1) : ''}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      <Typography color="textSecondary" component="div" variant="caption">
        <div>
          — not supported by that store, err threw (hover for the message), color runs from green (fastest) through
          yellow to red (slowest) per row, bold is the fastest.
        </div>
        <div>
          Immer and mutative stores use mutating recipes; the other stores use hand-written immutable updates, with only
          the changed fields written to the form.
        </div>
        <div>
          createAppStore and zustand + immer + devtools include devtools, which serializes the state on every update
          while Redux DevTools is open. The immer middleware column drafts with the global immer instance, which
          auto-freezes.
        </div>
      </Typography>
    </PageSection>
  );
});

StoreBenchmark.displayName = 'StoreBenchmark';
