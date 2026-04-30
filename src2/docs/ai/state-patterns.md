# State Patterns

## Reading State

Use `useAppConfig` with a selector to subscribe to a specific slice:

```typescript
// ✅ Correct — component only re-renders when this specific value changes
const isOpen = useAppConfig(c => c.layout.notifications.open);
const isAdmin = useAppConfig(c => c.user?.is_admin ?? false);
const lang = useAppConfig(c => c.layout.cookies.lang);
```

```typescript
// ❌ Wrong — subscribes to entire config, re-renders on any change
const config = useAppConfig(c => c);
```

### Multiple Values

Read multiple values with separate selectors:

```typescript
const open = useAppConfig(c => c.layout.notifications.open);
const count = useAppConfig(c => c.layout.notifications.unread);
```

Or use a single selector returning an object (auto-shallow-compared):

```typescript
const { open, count } = useAppConfig(c => ({
  open: c.layout.notifications.open,
  count: c.layout.notifications.unread
}));
```

## Writing State

Use `useAppSetConfig()` which returns a setter that shallow-merges at the top level:

```typescript
const setConfig = useAppSetConfig();

// Update nested state — must spread intermediate objects
setConfig({
  layout: {
    ...currentLayout,
    notifications: {
      ...currentLayout.notifications,
      open: true
    }
  }
});
```

### Important: Nested Spreading

`setConfig` does a **shallow merge** at the top level only. For nested properties, you must spread manually:

```typescript
// ✅ Correct — preserves layout.cookies, layout.drawer, etc.
setConfig({
  layout: { ...config.layout, notifications: { ...config.layout.notifications, open: false } }
});

// ❌ Wrong — clobbers all other layout properties
setConfig({ layout: { notifications: { open: false } } });
```

## API Data (React Query)

### Fetching

```typescript
const { data, isLoading, error } = useAPIQuery<ResponseType>({
  url: `/api/v4/notification/${feedKey}/`,
  method: 'GET',
  disabled: !feedKey,
  allowCache: true,
});
```

### Mutations

```typescript
const handleDelete = useAPIMutation(
  (id: string) => ({
    url: `/api/v4/notification/${id}/`,
    method: 'DELETE',
    onSuccess: () => {
      invalidateAPIQuery(({ url }) => url.startsWith('/api/v4/notification/'));
    },
  })
);
```

### Cache Invalidation

Always invalidate explicitly after mutations using `invalidateAPIQuery`:

```typescript
import { invalidateAPIQuery } from 'core/api';

// Invalidate by URL pattern
invalidateAPIQuery(({ url }) => url.startsWith('/api/v4/alert/'));

// Invalidate with delay
invalidateAPIQuery(({ url }) => url === '/api/v4/user/whoami/', 500);
```

## Per-Feature Stores

For feature-private state, use `createAppStore`:

```typescript
const [Provider, useStore] = createAppStore({
  items: [],
  selected: null,
  setSelected: (id) => set({ selected: id }),
});
```

Use when:
- State is private to one feature/component tree
- State has complex update logic
- State lifecycle is tied to mount/unmount

## Custom Hooks

Custom hooks exist for three purposes only:

1. **Named store access** — Wrapping a selector/setter with a semantic name (`useAppConfig`, `usePanel`)
2. **Utility-style logic** — Encapsulating `useMemo`/`useCallback`-style computation (`useFormattedDate`)
3. **Browser/frontend control** — Managing a browser API (`useLocalStorage`, `useTimeout`)

Hooks must be simple — they cannot be unit tested directly. They are tested indirectly via E2E tests or verified manually.

## What NOT to Do

- Do NOT use React Context for shared state
- Do NOT create wrapper hooks for single-use mutations
- Do NOT store API response data in the Zustand store (use React Query)
- Do NOT use `useState` for state needed by sibling/parent components
- Do NOT mutate the store directly — always go through `setConfig`
- Do NOT use `useEffect` for derived state — use `useMemo`
- Do NOT subscribe to the entire store — use focused selectors
