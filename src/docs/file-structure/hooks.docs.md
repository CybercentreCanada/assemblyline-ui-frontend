# Hook Patterns

## Purpose

Custom hooks encapsulate reusable reactive logic that multiple components need. They keep components thin by extracting shared subscriptions, computations, and browser interactions into named, composable units.

**Keep hooks simple.** Hooks cannot be unit tested directly — they are tested indirectly through component E2E tests. Complex orchestration inside a hook is hard to validate and debug. If the logic is complex but pure, extract it to a utility function and call that from the hook.

## When to Create a Hook

Custom hooks exist for three purposes:

1. **Named store access** — Wrapping a store selector or setter with a semantic name (e.g., `useAppConfig`, `useAppSetConfig`, `usePanel`)
2. **Utility-style logic** — Encapsulating a `useMemo`/`useCallback`-style computation that benefits from a reusable name (e.g., `useFormattedDate`, `useSortedItems`)
3. **Browser/frontend control** — Managing a browser API or frontend concern (e.g., `useLocalStorage`, `useTimeout`, `useMediaQuery`, `useIntersectionObserver`)

Do NOT create hooks for:
- Single-use state access (use `useAppConfig` directly in the component)
- Simple mutations (use `useAPIMutation` directly — no wrapper)
- Wrapping a single hook call with no added logic
- Complex multi-step flows that are hard to test indirectly

This ordering ensures consistent readability across all components — you always know where to look for a specific type of logic.

## Declaration Style

Hooks use `const` arrow functions with JSDoc, same as utility functions:

```typescript
/**
 * @name useNotificationCount
 * @description Returns unread notification count, recomputed when notifications change.
 * @returns Current unread count
 */
export const useNotificationCount = (): number => {
  const notifications = useAppConfig(c => c.notifications.items);
  return useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );
};
```

## File Organization

- Feature hooks live in `<feature>.hooks.tsx`
- Only export hooks that are used outside the module
- Keep internal/private hooks unexported (they still live in the same file)
- Hooks follow the same comment delimiter grouping as utility files

```typescript
//*****************************************************************************************
// Panel
//*****************************************************************************************

export const usePanelOpen = (): boolean => { ... };
export const usePanelToggle = (): (() => void) => { ... };

//*****************************************************************************************
// Notifications
//*****************************************************************************************

export const useNotificationCount = (): number => { ... };
```

## Examples of Valid Hooks

```typescript
// ✅ Named store access — semantic wrapper over selector
export const usePanelOpen = (): boolean => {
  return useAppConfig(c => c.layout.panel.open);
};

// ✅ Utility-style — reusable computation
export const useSortedItems = (items: Item[]): Item[] => {
  return useMemo(() => [...items].sort((a, b) => a.label.localeCompare(b.label)), [items]);
};

// ✅ Browser control — manages a browser API
export const useLocalStorage = <T>(key: string, initial: T): [T, (v: T) => void] => {
  // read/write localStorage with state sync
};
```

## Examples of Invalid Hooks

```typescript
// ❌ Single-use wrapper — no reuse, keep inline
const useMyComponentLogic = () => { ... };

// ❌ Wrapper around single mutation — no added value
export const useSaveNotification = () => useAPIMutation(() => ({ ... }));

// ❌ Re-exports a selector with no added logic
export const useIsOpen = () => useAppConfig(c => c.layout.panel.open);
// (valid only if used by 3+ components as a named access hook)
```

