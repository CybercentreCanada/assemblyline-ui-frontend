# features/store

Generic Zustand store factory for creating feature-scoped stores with context providers. Allows any feature or component tree to have its own isolated state without polluting the global `AppConfig`.

## Responsibilities

- `createAppStore` — factory that creates a typed Zustand store with devtools and `useShallow` selectors
- `createStoreContext` — lightweight context-based store using `useSyncExternalStore` (no Zustand dependency)
- Provider pattern for mounting stores at specific component tree boundaries

## Key Files

- `createAppStore.tsx` — Store factory with devtools integration (Zustand-based)
- `createStoreContext.tsx` — Context wrapper for scoped store access (vanilla `useSyncExternalStore`)

## Usage

### createAppStore (Zustand-based)

```typescript
import { createAppStore } from 'features/store';

type AlertStore = { selected: string[]; loading: boolean };

const { StoreProvider, useStore, useSetStore } = createAppStore<AlertStore>({
  selected: [],
  loading: false
});

// Mount at a subtree boundary
<StoreProvider data={{ loading: true }}>
  <AlertList />
</StoreProvider>

// Read with selector (auto-shallow compared)
const selected = useStore(s => s.selected);

// Write with partial or updater
const setStore = useSetStore();
setStore({ loading: false });
setStore(prev => ({ selected: [...prev.selected, id] }));
```

### createStoreContext (lightweight)

```typescript
import { createStoreContext } from 'features/store';

type DrawerStore = { open: boolean; width: number };

const { StoreProvider, useStore } = createStoreContext<DrawerStore>({
  open: false,
  width: 320
});

// Returns [value, setter] tuple
const [open, setStore] = useStore(s => s.open);
setStore({ open: true });
```

## When to Use Which

| Factory | Use case |
| ------- | -------- |
| `createAppStore` | Feature stores that benefit from Zustand devtools and shallow comparison |
| `createStoreContext` | Simple prop-driven stores where parent data changes should reset the store |
