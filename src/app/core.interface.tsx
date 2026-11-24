import type { AppDebugStoreHistory, AppDebugStoreName } from 'layout/debug';
import { getDefaultAppDebugStoreHistory } from 'layout/debug/debug.models';

declare global {
  /** Transient UI state managed by the interface store — nothing is persisted. */
  type AppInterfaceStore = {
    /** Debug panel state. */
    debug: {
      /** Captured snapshot history per observed store. */
      history: AppDebugStoreHistory;
      /** Active debug panel, or null when the panel is closed. */
      mode: null | 'api' | 'store';
      /** Identifier handed to the next captured snapshot. */
      nextSnapshotId: number;
      /** Selected snapshot, or null to follow the latest one. */
      snapshotId: number | null;
      /** Store currently inspected in the debug panel. */
      store: AppDebugStoreName;
    };
  };
}

export const DEFAULT_APP_INTERFACE_STORE: AppInterfaceStore = {
  debug: {
    history: getDefaultAppDebugStoreHistory(),
    mode: null,
    nextSnapshotId: 0,
    snapshotId: null,
    store: 'Config'
  }
};
