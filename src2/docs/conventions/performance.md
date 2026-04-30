# Performance

## Purpose

Performance is critical. The app presents large amounts of data across many pages simultaneously (multi-panel views). Every component and render cycle matters. The goal is to make the app feel instant — no jank, no unnecessary re-renders, no wasted computation.

## Core Principles

1. **Minimize re-renders** — each component should only re-render when its specific data changes
2. **Minimize DOM nodes** — fewer nodes = faster layout, paint, and interaction
3. **Minimize JavaScript execution** — defer, debounce, and virtualize wherever possible

## Component Re-render Prevention

### `memo()` on every component

Every exported component is wrapped in `memo()`. This prevents re-rendering when the parent re-renders but the component's props haven't changed.

### Focused store selectors

Read only the exact slice of state needed — never subscribe to an entire store:

```typescript
// ✅ Only re-renders when this specific boolean changes
const isOpen = useAppConfig(c => c.layout.notifications.open);

// ❌ Re-renders on ANY config change
const config = useAppConfig(c => c);
```

### Stable references

Avoid creating new objects, arrays, or functions in render that get passed as props — they break `memo()`:

```typescript
// ❌ New object every render — child always re-renders
<MyComponent style={{ padding: 8 }} />
<MyComponent options={['a', 'b', 'c']} />
<MyComponent onClick={() => doSomething()} />

// ✅ Stable references — child only re-renders when values actually change
const style = useMemo(() => ({ padding: 8 }), []);
const options = useMemo(() => ['a', 'b', 'c'], []);
const handleClick = useCallback(() => doSomething(), []);

<MyComponent style={style} />
<MyComponent options={options} />
<MyComponent onClick={handleClick} />
```

**Rule:** Every function passed as a prop must be wrapped in `useCallback`. Every object/array passed as a prop must be wrapped in `useMemo` or defined outside the component.

## Lists and Repeated Elements

When rendering 10+ items, performance of each item is critical:

### Use raw HTML over MUI

MUI components add significant overhead per instance. For list items, table rows, grid cells — use raw HTML with the `style` prop:

```typescript
// ✅ Fast — raw elements in a list
{items.map(item => (
  <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
    <span style={{ flex: 1 }}>{item.label}</span>
    <span style={{ color: theme.palette.text.secondary }}>{item.date}</span>
  </div>
))}

// ❌ Slow — MUI components in a list
{items.map(item => (
  <Stack key={item.id} direction="row" alignItems="center" sx={{ p: 1 }}>
    <Typography sx={{ flex: 1 }}>{item.label}</Typography>
    <Typography color="text.secondary">{item.date}</Typography>
  </Stack>
))}
```

### Virtualization

For lists that can grow to 100+ items, use virtualization to only render visible items:

- Use `react-window` or `@tanstack/react-virtual` for long scrollable lists
- Only render items within the viewport + a small overscan buffer
- Measure row heights if items have variable sizes

### Key props

Always use a stable, unique `key` prop. Never use array index as a key for dynamic lists:

```typescript
// ✅ Stable unique ID
{items.map(item => <Row key={item.id} item={item} />)}

// ❌ Index as key — breaks state when items reorder
{items.map((item, i) => <Row key={i} item={item} />)}
```

## Expensive Computations

### `useMemo` for derived data

Wrap expensive filtering, sorting, or transformation in `useMemo`:

```typescript
const filteredItems = useMemo(
  () => items.filter(i => i.status === activeFilter).sort((a, b) => a.score - b.score),
  [items, activeFilter]
);
```

### `useDeferredValue` for non-urgent updates

When typing into a search field that filters a large list, defer the filtered result so input stays responsive:

```typescript
const [query, setQuery] = useState('');
const deferredQuery = useDeferredValue(query);

const filtered = useMemo(
  () => items.filter(i => i.label.includes(deferredQuery)),
  [items, deferredQuery]
);
```

## No Code Splitting / No Lazy Loading

Do **not** use `lazy()` or dynamic `import()` for code splitting. The entire application is bundled and delivered upfront. A larger initial bundle is acceptable — it means the user never waits for additional chunks to load during navigation.

```typescript
// ❌ Never lazy-load
const Page = lazy(() => import('./page.components'));

// ✅ Import directly
import { Page } from './page.components';
```

**Why:** Lazy loading causes visible loading states during navigation. Users experience "flashes" of loading spinners as they move between routes. Delivering all code upfront eliminates this entirely — once the app loads, every transition is instant.

## What to Avoid

| Anti-pattern | Why | Fix |
|-------------|-----|-----|
| `useEffect` for derived state | Extra render cycle | Use `useMemo` instead |
| Object/array literals as props | New reference every render, breaks `memo()` | `useMemo` or define outside |
| Inline arrow functions as props | New reference every render | `useCallback` |
| Subscribing to entire store | Re-renders on any change | Focused selectors |
| MUI layout components in lists | Heavy per-instance overhead | Raw HTML + `style` |
| Unvirtualized lists of 100+ items | All items rendered, slow layout | Virtualize |
| Re-computing on every render | Wasted CPU | `useMemo` with deps |
