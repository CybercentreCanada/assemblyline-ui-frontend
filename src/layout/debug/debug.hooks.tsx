import { useAppConfigStoreApi } from 'core/config';
import {
  getAppInterfaceStateFromApi,
  useAppInterfaceStore,
  useAppInterfaceStoreApi,
  useAppSetInterfaceStore
} from 'core/interface';
import { getAppPreferenceStateFromApi, useAppPreferenceStoreApi } from 'core/preference';
import { useAppNavigationStoreApi, useAppRouterStoreApi } from 'core/router';
import { useAppLocationParamStoreApi } from 'core/routes';
import type { AppDebugStoreHistory, AppDebugStoreName } from 'layout/debug';
import { getDefaultAppDebugStoreHistory, serializeAppDebugState } from 'layout/debug';
import { useEffect, useMemo } from 'react';

//*****************************************************************************************
// Debug Stores
//*****************************************************************************************

type AppDebugStoreEntry = {
  name: AppDebugStoreName;
  getState: () => unknown;
  subscribe: (listener: () => void) => () => void;
};

const NOOP_UNSUBSCRIBE = () => undefined;

const omitStateKey = (state: unknown, key: string): unknown => {
  if (!state || typeof state !== 'object') return state;

  const next = { ...(state as Record<string, unknown>) };
  delete next[key];
  return next;
};

// The panel's own state lives in the interface store, so it is excluded to avoid recording itself.
const getSnapshotValue = (name: AppDebugStoreName, state: unknown): string =>
  serializeAppDebugState(name === 'Interface' ? omitStateKey(state, 'debug') : state);

/**
 * @name useAppDebugStoreHistory
 * @description Subscribes to every application zustand store and records a serialized snapshot
 *              into the interface store each time one of them changes.
 * @returns Snapshot history keyed by store name, oldest first
 */
export const useAppDebugStoreHistory = (): AppDebugStoreHistory => {
  const configApi = useAppConfigStoreApi();
  const interfaceApi = useAppInterfaceStoreApi();
  const preferenceApi = useAppPreferenceStoreApi();
  const routerApi = useAppRouterStoreApi();
  const navigationApi = useAppNavigationStoreApi();
  const locationApi = useAppLocationParamStoreApi();

  const history = useAppInterfaceStore(s => s.debug.history);
  const setInterfaceStore = useAppSetInterfaceStore();

  const entries = useMemo<AppDebugStoreEntry[]>(
    () => [
      {
        name: 'Config',
        getState: () => configApi?.getState(),
        subscribe: listener => configApi?.subscribe(listener) ?? NOOP_UNSUBSCRIBE
      },
      {
        name: 'Interface',
        getState: () => interfaceApi?.getState(),
        subscribe: listener => interfaceApi?.subscribe(listener) ?? NOOP_UNSUBSCRIBE
      },
      {
        name: 'Preference',
        getState: () => preferenceApi?.getState(),
        subscribe: listener => preferenceApi?.subscribe(listener) ?? NOOP_UNSUBSCRIBE
      },
      {
        name: 'Router',
        getState: () => routerApi?.getState(),
        subscribe: listener => routerApi?.subscribe(listener) ?? NOOP_UNSUBSCRIBE
      },
      {
        name: 'Navigation',
        getState: () => navigationApi?.getState(),
        subscribe: listener => navigationApi?.subscribe(listener) ?? NOOP_UNSUBSCRIBE
      },
      {
        name: 'Location',
        getState: () => locationApi?.getState(),
        subscribe: listener => locationApi?.subscribe(listener) ?? NOOP_UNSUBSCRIBE
      }
    ],
    [configApi, interfaceApi, locationApi, navigationApi, preferenceApi, routerApi]
  );

  useEffect(() => {
    const append = (name: AppDebugStoreName, value: string) => {
      const { debug } = getAppInterfaceStateFromApi(interfaceApi);

      if (debug.mode !== 'store') return;

      const snapshots = debug.history[name] ?? [];

      // Bail out before writing, otherwise recording the interface store would notify itself forever.
      if (snapshots[snapshots.length - 1]?.value === value) return;

      const maxSnapshots = getAppPreferenceStateFromApi(preferenceApi).debug.maxSnapshots;

      setInterfaceStore(s => {
        s.debug.history = {
          ...s.debug.history,
          [name]: [...snapshots, { id: s.debug.nextSnapshotId, timestamp: Date.now(), value }].slice(-maxSnapshots)
        };
        s.debug.nextSnapshotId += 1;
        return s;
      });
    };

    const unsubscribes = entries.map(entry => {
      append(entry.name, getSnapshotValue(entry.name, entry.getState()));
      return entry.subscribe(() => append(entry.name, getSnapshotValue(entry.name, entry.getState())));
    });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
      setInterfaceStore(s => {
        s.debug.history = getDefaultAppDebugStoreHistory();
        s.debug.nextSnapshotId = 0;
        s.debug.snapshotId = null;
        return s;
      });
    };
  }, [entries, interfaceApi, preferenceApi, setInterfaceStore]);

  return history;
};
