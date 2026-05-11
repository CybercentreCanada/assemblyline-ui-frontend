# features/prop-provider

Store-based prop distribution pattern that allows parent-to-child prop passing through an external store, enabling granular subscriptions per prop key without re-rendering the entire subtree when a single prop changes.

## Responsibilities

- `PropProvider` — Wraps children with an external prop store; syncs incoming props reactively
- `usePropStore` — Hook that returns a per-key selector and setter, powered by `useSyncExternalStore`
- Shallow reconciliation — Only notifies subscribers when prop values actually change

## Key Files

- `PropProvider.tsx` — `createPropStore`, `PropProvider`, `usePropStore`
- `props.utils.ts` — `shallowEqual`, `shallowReconcile` utilities
- `props.utils.test.ts` — Unit tests for shallow utilities

## Usage

```typescript
import { PropProvider, usePropStore } from 'features/prop-provider';

type RowProps = { selected: boolean; index: number; data: RowData };

// Parent provides props via the store
<PropProvider<RowProps> initialProps={{ selected: false, index: 0, data: null }} props={rowProps}>
  <RowContent />
</PropProvider>

// Child subscribes to a single key (re-renders only when that key changes)
const RowContent = memo(() => {
  const [useStore, setStore] = usePropStore<RowProps>();
  const selected = useStore('selected');
  const data = useStore('data');

  return <div className={selected ? 'active' : ''}>{data.name}</div>;
});
```

## How It Works

1. `PropProvider` creates an internal store on mount with `initialProps`
2. When `props` change, the store calls `reset()` which shallow-reconciles incoming vs previous props — only changed keys trigger subscriber notifications
3. `usePropStore` returns a `[useStore, set]` tuple:
   - `useStore(key)` — subscribes to a single prop key via `useSyncExternalStore`
   - `set(partial)` — imperatively update the store (useful for local overrides)
