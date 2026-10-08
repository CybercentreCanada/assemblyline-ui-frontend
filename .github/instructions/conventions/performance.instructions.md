---
description: "Use when changing React render paths, store selectors, memoization, list rendering, or performance-sensitive TypeScript."
applyTo: "src/**/*.ts, src/**/*.tsx"
---

# Performance — AI Rules

## Must

- Every exported component wrapped in `memo()`
- Focused store selectors — never subscribe to entire store
- Store selectors must access the most nested (leaf) values — never select a parent object and read its fields later
- For the app's `createStoreContext` store, mutate only changed nested fields and return the state; its setter creates a new root reference and notifies subscribers. Avoid spreading nested parent objects. For vanilla Zustand without Immer, use immutable updates so subscribers are notified.
- Functions passed as props must use `useCallback`
- Computed arrays/objects (filter, sort, map, spread) passed as props must use `useMemo`
- Empty array/object defaults must be module-level constants
- Raw HTML + `style` for lists of 10+ items — no MUI layout components
- Virtualize lists of 100+ items (`@tanstack/react-virtual`)
- Stable unique `key` prop — never array index for dynamic lists
- `useMemo` for derived/filtered/sorted data
- `useDeferredValue` for search-filtered large lists

## Simple Inline Objects Are OK

Simple static objects do not need `useMemo`:

```typescript
// ✅ Simple static style — OK inline
<div style={{ display: 'flex', gap: 8 }}>{children}</div>
<MyComponent config={{ rows: 5, dense: true }} />

// ❌ Computed value — needs useMemo
<MyComponent items={items.filter(i => i.active)} />
<MyComponent sorted={[...items].sort((a, b) => a.score - b.score)} />

// ✅ Stabilized
const activeItems = useMemo(() => items.filter(i => i.active), [items]);
```

**Rule:** If it involves computation (filtering, sorting, mapping, spreading) → `useMemo`. If it's a plain static literal → inline is fine.

## Empty Defaults Outside Components

```typescript
// ✅ Module-level — same reference every render
const EMPTY_SERVICES: MinimalService[] = [];

export const MyComponent = memo(() => {
  const services = useAppConfigStore(s => s?.services ?? EMPTY_SERVICES);
});

// ❌ Inline default — new array every render
const services = useAppConfigStore(s => s?.services ?? []);
```

## Store Selectors — Access Leaf Values

Vanilla Zustand uses `Object.is` to detect whether the next state changed. Mutating the current state and returning the same object is treated as unchanged, so subscribers are not notified. The app's `createStoreContext` setter instead shallow-copies the root and notifies subscribers after its updater runs. Since nested references are preserved by in-place field updates, select leaf values rather than parent objects to observe changes and avoid unrelated re-renders.

```typescript
// ❌ Selecting the parent object — re-renders when any field on the route changes
const route = useStore(s => s.routes[routeKey]);
return <AppRoutes href={route.href} state={route.state} />;

// ✅ Selecting each leaf field — re-renders only when that field changes
const href = useStore(s => s?.routes?.[routeKey]?.href || undefined);
const state = useStore(s => s?.routes?.[routeKey]?.state || undefined);
return <AppRoutes href={href} state={state} />;
```

**Rule:** Always select the most deeply nested primitive or leaf value you actually need. One selector per field.

## Store Mutations — Mutate In Place

The app's `createStoreContext` setter runs the updater, shallow-copies the root state, and notifies subscribers. This lets an updater change a nested field in place without spreading every parent object; return the state so the setter can merge it into the new root. Use leaf selectors because unchanged nested references are retained.

```typescript
// ❌ Spreading creates new references along the update path; selectors returning those objects re-render
setStore(s => ({ ...s, routes: { ...s.routes, [key]: { ...s.routes[key], href: newHref } } }));

// ✅ Mutate in place — only selectors for `href` will re-render
setStore(s => {
  s.routes[key].href = newHref;
  return s;
});
```

## Derived State

```typescript
// ✅ useMemo for derived data
const filtered = useMemo(
  () => items.filter(i => i.active).sort((a, b) => a.score - b.score),
  [items]
);

// ❌ useEffect to compute derived state
useEffect(() => { setFiltered(items.filter(...)); }, [items]);
```

## MUI Performance

- MUI components add significant overhead per instance (emotion CSS-in-JS)
- Prefer raw HTML elements + `style` prop over MUI components for performance
- Use MUI only for behavior (ripple, transitions, focus traps) — not layout
- In lists/loops: always raw HTML + `style` prop
- Never use `Box`, `Stack`, `Grid` as layout primitives
- When using MUI components: use `sx` prop for styling
- When using raw HTML elements: use `style` prop for styling

## Never

- NO `useEffect` for derived state — use `useMemo`
- NO inline arrow functions as JSX props — use `useCallback`
- NO computed arrays/objects inline as props — use `useMemo`
- NO subscribing to entire store
- NO selecting a parent object from a store and reading its fields in JSX — select each leaf field separately
- NO spreading/replacing parent objects in store mutations — mutate fields in place
- NO `lazy()` or code splitting — everything bundled upfront
- NO unvirtualized lists of 100+ items
- NO MUI layout components (`Box`, `Stack`, `Grid`) — raw HTML
- NO `style` prop on MUI components — use `sx`
- NO `sx` prop on raw HTML elements — use `style`
