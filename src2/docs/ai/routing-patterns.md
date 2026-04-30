# Routing Patterns

## Overview

The app uses a custom multi-panel router built on react-router v6. It supports concurrent split views with LRU-cached nodes and reverse portals for state preservation. All navigation is type-safe via route factories.

## Adding a New Route

1. Define the route in `app/app.routes.tsx`:

   ```typescript
   export const myPageRoute = createRoute({
     path: '/my-page/:id',
     params: z.object({ id: z.string() }),
     search: z.object({ tab: z.enum(['overview', 'details']).optional() }),
   });
   ```

2. Create the page component in `pages/MyPage.tsx`

3. The router system handles caching and portal registration automatically

## Navigation

Use typed navigation — never construct URL strings manually:

```typescript
// ✅ Correct — type-safe, validated at compile time
navigate(myPageRoute, { params: { id: '123' }, search: { tab: 'details' } });

// ❌ Wrong — untyped string, no validation
navigate('/my-page/123?tab=details');
```

## Reading Route Params

```typescript
// Path params
const { id } = useRouteParams(myPageRoute);  // typed: { id: string }

// Search params
const { tab } = useRouteSearch(myPageRoute);  // typed: { tab?: 'overview' | 'details' }
```

## Panel Navigation

For multi-panel scenarios, navigate within a specific panel:

```typescript
const { navigate } = usePanelNavigation();
navigate(myPageRoute, { params: { id: '456' } });
```

## Navigation Hooks

| Hook | Purpose |
| ---- | ------- |
| `useNavigate` | Navigate to a typed route |
| `useRouteParams` | Read typed path params |
| `useRouteSearch` | Read typed search params |
| `useRouteHash` | Read hash value |
| `usePanel` | Get current panel context |
| `usePanelNavigation` | Navigate within a specific panel |

## File Organization

```text
core/router/        → Router engine: models, providers, hooks, utils
core/routes/        → Route definitions: factories, typed params, guards
layout/router/      → Router UI: AppRouterLayout, AppRouterPanel, AppRouterNode
features/portal/    → InPortal/OutPortal (state-preserving portals)
app/app.routes.tsx  → Route registry: all page routes declared here
```

## Route Guards

If a route requires authentication or permissions, handle it at the layout level (e.g., `layout/auth/`), not in the page component.

## Do NOT

- Do NOT use `useNavigate()` from react-router directly — use the typed navigation hooks
- Do NOT construct URL strings by hand
- Do NOT put route logic in page components — pages are pure render
- Do NOT add routes without defining their param schemas
- Do NOT use `lazy()` for route-level code splitting — all pages are imported directly
