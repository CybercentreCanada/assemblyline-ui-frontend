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

### Store selectors — access leaf values

Zustand (and similar stores that use in-place mutation) only trigger re-renders when the selected value's reference changes. If you select a parent object and then read its fields in JSX, the component will **not** re-render when those fields are mutated — because the parent object's reference never changed.

Always select the most deeply nested primitive or leaf value you actually need. Use one selector per field:

```typescript
// ❌ Selecting the parent object — won't re-render when `href` or `state` is mutated
const route = useStore(s => s.routes[routeKey]);
return <AppRoutes href={route.href} state={route.state} />;

// ✅ Selecting each leaf field — re-renders only when that specific field changes
const href = useStore(s => s?.routes?.[routeKey]?.href || undefined);
const state = useStore(s => s?.routes?.[routeKey]?.state || undefined);
return <AppRoutes href={href} state={state} />;
```

### Store mutations — mutate in place

Never spread or replace a parent object in the store. Mutate individual fields directly so that only the selectors watching those specific fields re-render:

```typescript
// ❌ Spreading creates a new object — ALL selectors on that subtree re-render
setStore(s => ({ ...s, routes: { ...s.routes, [key]: { ...s.routes[key], href: newHref } } }));

// ✅ Mutate in place — only selectors for `href` will re-render
setStore(s => { s.routes[key].href = newHref; return s; });
```

**Why this matters:** The combination of in-place mutation + leaf-level selectors is what gives us surgical re-renders. If you break either side of the contract (spread a parent, or select a parent), the system stops working correctly.

### Stable references

Not all inline objects break `memo()`. Simple, static objects (like a `style` prop with a few properties) are cheap to create and compare — React's shallow comparison handles them fine in practice. The rule is about **complexity**, not just inline syntax.

**When inline is OK:**
- Simple `style` objects with static values: `style={{ display: 'flex', gap: 8 }}`
- Small static configuration objects with primitive values

**When `useMemo`/`useCallback` is required:**
- Arrays that are filtered, sorted, or transformed
- Objects built from dynamic data or state
- Functions passed as props (always `useCallback`)
- Any value computed from dependencies that change

```typescript
// ✅ Simple static style — OK inline
<div style={{ display: 'flex', gap: 8 }}>{children}</div>

// ✅ Simple static config — OK inline
<MyComponent config={{ rows: 5, dense: true }} />

// ❌ Dynamic computation — needs useMemo
<MyComponent items={items.filter(i => i.active)} />
<MyComponent sorted={[...items].sort((a, b) => a.score - b.score)} />

// ✅ Dynamic computation — stabilized
const activeItems = useMemo(() => items.filter(i => i.active), [items]);
<MyComponent items={activeItems} />

// ❌ Function prop — always needs useCallback
<MyComponent onClick={() => doSomething(id)} />

// ✅ Function prop — stabilized
const handleClick = useCallback(() => doSomething(id), [id]);
<MyComponent onClick={handleClick} />
```

**Rule:** Functions passed as props must always be wrapped in `useCallback`. Objects/arrays that involve computation (filtering, sorting, mapping, spreading) must be wrapped in `useMemo`. Simple static objects are fine inline.

## Lists and Repeated Elements

When rendering 10+ items, performance of each item is critical:

### Use raw HTML over MUI

MUI components carry significant overhead per instance through emotion's CSS-in-JS engine. For list items, table rows, grid cells — use raw HTML with the `style` prop:

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

Do not use `Box`, `Stack`, `Grid`, or `Paper` as layout primitives — especially inside loops. Use MUI components only when you need their specific behavior (ripple, transitions, focus traps).

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
| Computed arrays/objects as props | New reference every render, breaks `memo()` | `useMemo` |
| Inline arrow functions as props | New reference every render | `useCallback` |
| Subscribing to entire store | Re-renders on any change | Focused selectors |
| Selecting a parent object from store | Won't react to field mutations | Select each leaf field separately |
| Spreading/replacing objects in store | Re-renders all selectors on that subtree | Mutate fields in place |
| MUI layout components (`Box`, `Stack`, `Grid`) | Heavy per-instance overhead | Raw HTML + `style` |
| MUI `sx` prop | Emotion CSS-in-JS overhead | `styled()` or `style` prop |
| Unvirtualized lists of 100+ items | All items rendered, slow layout | Virtualize |
| Re-computing on every render | Wasted CPU | `useMemo` with deps |
