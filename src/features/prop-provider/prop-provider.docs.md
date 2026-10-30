# Features/Prop-Provider

## 1. Purpose

Provides a typed provider and external store for distributing object props through a component tree. Consumers subscribe to individual keys so unrelated prop changes do not re-render every consumer.

## 2. Features

- **Typed prop store** - Stores values from a generic object type
- **Key-level subscriptions** - Reads one prop key through `useSyncExternalStore`
- **Reactive synchronization** - Reconciles incoming provider props when they change
- **Local updates** - Exposes a setter for partial prop updates
- **Validation helpers** - Checks values and numeric ranges
- **Reconciliation helpers** - Combines incoming, previous, existing, and initial values

## 3. Concepts

### PropProvider

`PropProvider<Props>` creates the store and provides it to descendants. It accepts `initialProps` for the initial state and `props` for values synchronized from the parent.

### usePropStore

`usePropStore<Props>()` returns a tuple containing a key-level selector hook and the store setter:

- `useStore(key, isEqual?)` subscribes to one key and returns its current value.
- `set(partial)` applies a partial object or derives one from the current state.

### Reconciliation

`shallowReconcile` preserves existing values that are not replaced by current incoming props, while `deepReconcile` uses initial values as fallbacks for missing keys. `shallowEqual` prevents notifications when values did not change.

## 4. Configuration

| Prop | Required | Behavior |
| --- | --- | --- |
| `initialProps` | Yes | Values used to initialize the store |
| `props` | Yes | Values or updater function synchronized into the store |
| `children` | Yes | Descendant elements that receive the store |

The utility helpers accept optional numeric `min` and `max` bounds through `isValidNumber`.

## 5. Usage

```tsx
import { memo } from 'react';
import { PropProvider, usePropStore } from 'features/prop-provider';

type RowProps = {
  data: { name: string };
  index: number;
  selected: boolean;
};

const RowContent = memo(() => {
  const [useStore] = usePropStore<RowProps>();
  const selected = useStore('selected');
  const data = useStore('data');

  return <div className={selected ? 'active' : ''}>{data.name}</div>;
});

const Row = (props: RowProps) => (
  <PropProvider<RowProps> initialProps={props} props={props}>
    <RowContent />
  </PropProvider>
);
```

The provider and hook must be used within the same provider tree. Calling `usePropStore` without a matching `PropProvider` throws an error.

## 6. Codebase (Internals)

### Key Files

| File | Role |
| --- | --- |
| `prop-provider.providers.tsx` | `PropProvider` and `usePropStore` implementation |
| `prop-provider.utils.ts` | Validation, equality, and reconciliation utilities |
| `prop-provider.utils.test.ts` | Unit tests for the utilities |
| `index.ts` | Explicit public exports |

### Data Flow And Boundaries

The provider receives the initial and parent-supplied props, creates one store instance, and synchronizes new `props` values in an effect. Subscribers select a key from that store. Equality checks suppress emissions when the selected value is unchanged.

## 7. Related Modules

- `ui/inputs/` - Uses the provider for input controller props
- `features/search-params/` - Reuses `shallowEqual` for parameter state comparisons
