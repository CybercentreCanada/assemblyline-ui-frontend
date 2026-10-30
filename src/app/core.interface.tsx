declare global {
  /** Transient UI state managed by the interface store — nothing is persisted. */
  type AppInterfaceStore = {};
}

export const DEFAULT_APP_INTERFACE_STORE: AppInterfaceStore = {};
