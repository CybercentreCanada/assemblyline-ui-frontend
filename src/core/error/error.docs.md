# Core/Error

## 1. Purpose

Provides application-level React error handling so an unhandled render error displays a recovery screen instead of leaving the user with a blank application. The app shell consumes the provider; feature pages do not need to add their own boundary.

## 2. Features

- **Application boundary** - `AppErrorProvider` catches errors from its descendant React tree.
- **Localized fallback** - `ErrorFallback` displays translated error messaging, the error message, and an expandable stack trace.
- **Recovery** - The fallback can reload the application; chunk-loading errors trigger an automatic reload.
- **Crash test page** - `CrashPage` deliberately throws an error for exercising the fallback in development and E2E tests.

## 3. Concepts

### `AppErrorProvider`

The public wrapper around `react-error-boundary`. It supplies `ErrorFallback` as the boundary fallback and reloads the window when the boundary is reset.

### `ErrorFallback`

The fallback component supplied to the error boundary. It receives the `FallbackProps` from `react-error-boundary`. For ordinary runtime errors it shows the message and lets the user expand the stack; for `ChunkLoadError` it shows a loading message while the page reloads.

### `CrashPage`

A test page that throws an error when rendered. It is mounted at `/crash` so the error flow can be exercised without introducing an application defect.

### E2E page objects

`ErrorBoundary` represents the reusable fallback UI. `CrashPage` represents the `/crash` page and its navigation. They are separate POMs because one models a component and the other a page.

## 5. Usage

Wrap the application subtree that should be protected with the public provider:

```tsx
import { AppErrorProvider } from 'core/error';

<AppErrorProvider>
  <App />
</AppErrorProvider>;
```

`AppErrorProvider` already connects the boundary to `ErrorFallback`; consumers normally mount the provider rather than rendering the fallback directly. `ErrorFallback` is also exported from `core/error` for consumers that need to supply the same fallback to a separately configured `react-error-boundary`.

The provider is mounted around the application content in `AppProvider`.

## 6. Codebase (Internals)

| File                                        | Role                                                      |
| ------------------------------------------- | --------------------------------------------------------- |
| `error.components.tsx`                      | `ErrorFallback` UI and its styled elements                |
| `error.providers.tsx`                       | `AppErrorProvider` boundary and reload-on-reset behavior  |
| `error.route.tsx`                           | `CrashPage` test route component                          |
| `error.pom.ts`                              | E2E page object for the `/crash` route                    |
| `error-boundary.pom.ts`                     | E2E component object for the shared error fallback        |
| `error.i18n.en.json` / `error.i18n.fr.json` | English and French error messages                         |
| `index.ts`                                  | Public exports for `AppErrorProvider` and `ErrorFallback` |

## 7. Related Modules

- `core/template/components/app/AppProvider.tsx` - Mounts `AppErrorProvider` around the application content.
- `react-error-boundary` - Provides the underlying React error-boundary implementation.
