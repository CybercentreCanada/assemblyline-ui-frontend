# core/api

Centralized API client built on TanStack React Query. Provides typed hooks for all server communication — queries for reading data and mutations for writing it.

## Responsibilities

- HTTP client abstraction with request/response interceptors
- XSRF token handling and credential management
- `useAPIQuery` — typed hook for GET requests with caching, refetching, and persistence
- `useAPIMutation` — typed hook for POST/PUT/DELETE requests with optimistic updates
- `useAPICallFn` — imperative API call function for use outside React components
- Response parsing utilities (error extraction, status handling)
- Query client provider configuration (stale time, retry, persistence)

## Key Files

- `api.config.ts` — Base URL, default headers, timeout configuration
- `api.hooks.tsx` — Core query/mutation hooks
- `api.models.ts` — Request/response type definitions
- `api.provider.tsx` — QueryClientProvider wrapper with persistence
- `api.utils.ts` — Response parsing, error formatting utilities

## Usage Patterns

All server communication goes through `useAPIQuery` and `useAPIMutation`. Never use raw `fetch`, `axios`, or `useQuery`/`useMutation` directly. These hooks normalize responses, handle retries, manage XSRF tokens, and integrate with the app's error handling.

### Queries (Reading Data)

Use `useAPIQuery` for all GET requests:

```typescript
const { data, isLoading, isError, error } = useAPIQuery<ResponseType>({
  url: '/api/v4/alert/',
  method: 'GET',
});
```

#### Common Options

```typescript
const { data } = useAPIQuery<ResponseType>({
  url: `/api/v4/submission/${id}/`,
  method: 'GET',
  disabled: !id,                    // Skip query until ID is available
  delay: 300,                       // Debounce (useful for search-as-you-type)
  allowCache: true,                 // Enable React Query caching
  onSuccess: (response) => { },     // Side effect on success
  onFailure: (error) => { },        // Side effect on failure
});
```

**Rules:**

- Always type the response: `useAPIQuery<ResponseType>(...)`
- Use `disabled` to conditionally skip queries — never conditionally call the hook
- Use `delay` for user-input-driven queries (search, filtering)
- Mutations that affect the same data should invalidate related queries

#### Conditional Queries

```typescript
// ✅ Disable when dependency is missing
const { data } = useAPIQuery<Detail>({
  url: `/api/v4/alert/${alertId}/`,
  disabled: !alertId,
});

// ❌ Never conditionally call a hook
if (alertId) {
  const { data } = useAPIQuery(...); // Breaks Rules of Hooks
}
```

### Mutations (Writing Data)

Use `useAPIMutation` for all POST, PUT, DELETE requests. Mutations are defined inline in the component — no wrapper hooks for single-use mutations.

```typescript
const handleSubmit = useAPIMutation(
  (body: SubmitRequest) => ({
    url: '/api/v4/submission/',
    method: 'POST',
    body,
    onSuccess: () => {
      // Navigate, show snackbar, invalidate queries, etc.
    },
  })
);

// Usage
handleSubmit.mutate(formData);
```

#### With Cache Invalidation

```typescript
import { invalidateAPIQuery } from 'core/api';

const handleDelete = useAPIMutation(
  (id: string) => ({
    url: `/api/v4/alert/${id}/`,
    method: 'DELETE',
    onSuccess: () => {
      invalidateAPIQuery(({ url }) => url.startsWith('/api/v4/alert/'));
    },
  })
);
```

#### Mutation State in UI

```typescript
const handleSave = useAPIMutation(
  (body: UpdateRequest) => ({
    url: `/api/v4/submission/${id}/`,
    method: 'POST',
    body,
    onSuccess: () => { ... },
  })
);

return (
  <Button
    onClick={() => handleSave.mutate(formData)}
    disabled={handleSave.isPending}
  >
    {handleSave.isPending ? 'Saving...' : 'Save'}
  </Button>
);
```

### Inline Mutations — No Wrapper Hooks

Mutations are defined where they're used. Do not create custom hooks that wrap a single mutation:

```typescript
// ✅ Inline in the component
const MyComponent = memo(() => {
  const handleDelete = useAPIMutation(
    (id: string) => ({
      url: `/api/v4/alert/${id}/`,
      method: 'DELETE',
      onSuccess: () => { ... },
    })
  );

  return <Button onClick={() => handleDelete.mutate(alertId)}>Delete</Button>;
});

// ❌ Never create a wrapper hook for a single mutation
const useDeleteAlert = () => {
  return useAPIMutation((id: string) => ({
    url: `/api/v4/alert/${id}/`,
    method: 'DELETE',
  }));
};
```

**Why:** Wrapper hooks hide data flow. When reading a component, you should see exactly what API call it makes without jumping to another file. If multiple components need the same mutation, that's fine — duplication of a 5-line mutation definition is better than indirection.

### Cache Invalidation

After a mutation that changes data, invalidate related queries so they refetch:

```typescript
import { invalidateAPIQuery } from 'core/api';

// Invalidate by URL pattern
invalidateAPIQuery(({ url }) => url.startsWith('/api/v4/alert/'));

// Invalidate a specific query
invalidateAPIQuery(({ url }) => url === '/api/v4/user/whoami/');

// Invalidate with delay (wait for backend to process)
invalidateAPIQuery(({ url }) => url.startsWith('/api/v4/alert/'), 500);
```

### Error Handling

Errors are available on the hook's return value. Handle them in the UI or via the `onFailure` callback:

```typescript
const { data, isError, error } = useAPIQuery<ResponseType>({
  url: '/api/v4/alert/',
  onFailure: (err) => {
    // Show snackbar, log, etc.
  },
});

// In JSX
{isError && <ErrorDisplay error={error} />}
```

### What NOT to Do

| Anti-pattern | Why | Do instead |
| ------------ | --- | ---------- |
| Raw `fetch` or `axios` | Bypasses token handling, error normalization, caching | `useAPIQuery` / `useAPIMutation` |
| `useQuery` / `useMutation` directly | Bypasses app conventions and response normalization | Use the app's hooks |
| Wrapper hooks for single mutations | Hides data flow, premature abstraction | Inline mutations |
| Calling hooks conditionally | Breaks Rules of Hooks | Use `disabled` prop |
| Manual `refetch()` after mutations | Easy to forget, stale data | `invalidateAPIQuery` |
