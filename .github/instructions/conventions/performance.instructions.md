---
description: 'Use when changing React render paths, memoization, list rendering, or performance-sensitive TypeScript.'
applyTo: 'src/**/*.ts, src/**/*.tsx'
---

# Performance — AI Rules

> Applies to new and modified code. Legacy code is exempt until it is touched; do not refactor it unless asked.

## Must

- Every exported component wrapped in `memo()`
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

export const MyComponent = memo(({ services = EMPTY_SERVICES }: MyComponentProps) => {
  // ...
});

// ❌ Inline default — new array every render
export const MyComponent = memo(({ services = [] }: MyComponentProps) => {
  // ...
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
- NO `lazy()` or code splitting — everything bundled upfront
- NO unvirtualized lists of 100+ items
- NO MUI layout components (`Box`, `Stack`, `Grid`) — raw HTML
- NO `style` prop on MUI components — use `sx`
- NO `sx` prop on raw HTML elements — use `style`
