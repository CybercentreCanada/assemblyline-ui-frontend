# Components

> Applies to: `*.components.tsx` files and files inside `components/` folders.

## Template

```typescript
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppConfig, useAppSetConfig } from 'core/config';
import type { MyComponentProps } from './my-feature.models';

//*****************************************************************************************
// My Component
//*****************************************************************************************

/** Props for MyComponent. */
export type MyComponentProps = {
  /** Whether the panel is open. */
  open: boolean;
  /** Callback fired when requesting close. */
  onClose: () => void;
};

export const MyComponent = memo(({ open, onClose }: MyComponentProps) => {
  const { t } = useTranslation(['myModule']);
  const someValue = useAppConfig(c => c.layout.someValue);
  const setConfig = useAppSetConfig();

  const handleAction = useCallback(() => {
    setConfig(prev => ({
      layout: {
        ...prev.layout,
        someFeature: { ...prev.layout.someFeature, value: 'new' }
      }
    }));
  }, [setConfig]);

  return !open ? null : (
    <div>{t('feature.title')}</div>
  );
});

MyComponent.displayName = 'MyComponent';
```

## Rules

- `memo()` on every exported component
- `.displayName` set immediately after definition
- Comment delimiter block (`//***...`) above each component
- Props as exported `type` above component, JSDoc per field, alphabetical order
- NO `React.FC`, NO `React.FunctionComponent`, NO default exports
- One component = one responsibility — prefer many small files
- Data from stores, not props — props are for configuration only (variant, size, disabled)
- Keep < 5 props per component

## Hook Ordering (strict)

1. Library hooks (`useTranslation`, `useNavigate`, `useTheme`)
2. App/core hooks (`useAppConfig`, `useAppSetConfig`, `useAPIQuery`, `useSnackbar`)
3. `useState` (rare — local ephemeral UI only)
4. `useRef`
5. `useMemo`
6. `useMediaQuery`
7. `useCallback` (event handlers)
8. `useEffect` (last resort — side effects only)

## Event Handlers

- ALL internal functions wrapped in `useCallback`
- `handle<Action>` = local handler (`handleOpen`, `handleSave`)
- `on<Action>` = prop callback (`onClose`, `onChange`)
- A `handle*` may call an `on*` prop after processing

## Conditional Rendering

- Ternary for either/or (`isLoading ? <Spinner /> : <Content />`)
- `&&` for show-or-nothing (`{error && <ErrorMessage />}`)
- Never early return — single JSX expression returned
- For complex multi-state, extract into a `useMemo` variable

```typescript
// ✅ Ternary
{isLoading ? <Spinner /> : <Content items={items} />}

// ✅ && for presence
{error && <ErrorMessage error={error} />}

// ✅ Nested ternary for multiple states
{isLoading ? <Spinner /> : error ? <ErrorMessage /> : <Content />}

// ❌ Never early return
if (isLoading) return <Spinner />;
```

## State Access

| Solution | When |
|----------|------|
| `useAppConfig(c => c.path)` | App-wide state (layout, auth, config) |
| `createAppStore` | Feature-scoped shared state |
| TanStack Form stores | Form state with validation |

- Always use focused selectors — never subscribe to entire store
- Write via callback: `setConfig(prev => ({ ...prev.layout, ... }))`

## Decision Table

| Scenario | Style |
|----------|-------|
| Standard component | `export const X = memo((...) => { ... })` |
| Generic component | `function` keyword + `memo(forwardRef(...))` + type cast |
| Hooks, handlers, utilities | `const` arrow function |

## Generic Component Pattern

```typescript
export type ComponentProps<T extends BaseType> = { item: T };

export function WrappedComponent<const T extends BaseType>(
  { item, ...props }: ComponentProps<T>,
  ref: ForwardedRef<HTMLElement>
) {
  return <div {...props} ref={ref}>{item.label}</div>;
}

export const Component = memo(forwardRef(WrappedComponent)) as <const T extends BaseType>(
  props: ComponentProps<T> & { ref?: ForwardedRef<HTMLElement> }
) => JSX.Element | null;

WrappedComponent.displayName = 'WrappedComponent';
(Component as any).displayName = 'Component';
```

## Anti-Patterns

```typescript
// ❌ Wrapper hook for single-use logic
const useMyComponentLogic = () => { ... };

// ❌ Prop drilling store data
<MyComponent user={user} config={config} />

// ❌ Default export
export default MyComponent;

// ❌ React.FC
const MyComponent: React.FC<Props> = () => { ... };

// ❌ Early return for conditional rendering
if (!data) return null;

// ❌ Missing displayName
export const Foo = memo(() => { ... });

// ❌ Direct setConfig without callback
setConfig({ layout: { ...config.layout, open: true } });

// ❌ Redux patterns
dispatch(action); useReducer(...); useSelector(...)
```
