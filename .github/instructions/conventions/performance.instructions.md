---
description: "Use when changing React render paths, store selectors, memoization, list rendering, or performance-sensitive TypeScript."
applyTo: "src/**/*.ts, src/**/*.tsx"
---

# Performance — AI Rules

> Applies to new and modified code. Legacy code is exempt until it is touched; do not refactor it unless asked.

## Must

- Every exported component wrapped in `memo()`
- Focused store selectors — never subscribe to entire store
- Store selectors must access the most nested (leaf) values — never select a parent object and read its fields later
- Update store state by mutating the changed fields in place inside the `useAppSetConfigStore` callback — never spread parent objects (see Store Mutations)
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

The app store's setter runs the updater, shallow-copies the root state, and notifies subscribers, but nested objects keep their references. A selector that returns a nested object therefore never sees in-place field changes, so select leaf values rather than parent objects to observe changes and avoid unrelated re-renders.

```typescript
// ❌ Selecting the parent object — won't re-render when `href` or `state` is mutated in place
const route = useStore(s => s.routes[routeKey]);
return <AppRoutes href={route.href} state={route.state} />;

// ✅ Selecting each leaf field — re-renders only when that field changes
const href = useStore(s => s?.routes?.[routeKey]?.href || undefined);
const state = useStore(s => s?.routes?.[routeKey]?.state || undefined);
return <AppRoutes href={href} state={state} />;
```

**Rule:** Always select the most deeply nested primitive or leaf value you actually need. One selector per field.

## Store Mutations — Mutate In Place

The app store's setter runs the updater, shallow-copies the root state, and notifies subscribers. An updater can therefore change a nested field in place without spreading every parent object, which avoids allocating new objects along the update path. Return the state so the setter can merge it into the new root. Only leaf selectors observe these changes, because unchanged nested references are retained.

```typescript
// ❌ Spreading allocates new objects along the update path
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
- NO spreading parent objects in store updates — mutate the changed fields in place
- NO `lazy()` or code splitting — everything bundled upfront
- NO unvirtualized lists of 100+ items
- NO MUI layout components (`Box`, `Stack`, `Grid`) — raw HTML
- NO `style` prop on MUI components — use `sx`
- NO `sx` prop on raw HTML elements — use `style`
