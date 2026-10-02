/** Application zustand stores that can be inspected from the debug panel. */
export const APP_DEBUG_STORE_NAMES = ['Config', 'Interface', 'Preference', 'Router', 'Navigation', 'Location'] as const;

export type AppDebugStoreName = (typeof APP_DEBUG_STORE_NAMES)[number];

/** A single point-in-time serialization of a store. */
export type AppDebugStoreSnapshot = {
  /** Monotonic identifier, unique across every store. */
  id: number;
  /** Epoch milliseconds at which the snapshot was captured. */
  timestamp: number;
  /** Serialized store state. */
  value: string;
};

/** Snapshot history keyed by store name, oldest first. */
export type AppDebugStoreHistory = Record<AppDebugStoreName, AppDebugStoreSnapshot[]>;

/**
 * @name getDefaultAppDebugStoreHistory
 * @description Builds an empty snapshot history containing an entry for every observed store.
 * @returns Snapshot history with an empty list per store
 */
export const getDefaultAppDebugStoreHistory = (): AppDebugStoreHistory =>
  APP_DEBUG_STORE_NAMES.reduce((history, name) => ({ ...history, [name]: [] }), {} as AppDebugStoreHistory);
