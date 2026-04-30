# features/store

Generic Zustand store factory for creating feature-scoped stores with context providers. Allows any feature or component tree to have its own isolated state without polluting the global `AppConfig`.

## Responsibilities

- `createAppStore` — factory that creates a typed Zustand store with devtools
- `createStoreContext` — wraps a store in a React context for scoped access
- Provider pattern for mounting stores at specific component tree boundaries

## Key Files

- `createAppStore.tsx` — Store factory with devtools integration
- `createStoreContext.tsx` — Context wrapper for scoped store access
