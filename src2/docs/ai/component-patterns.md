# Component Patterns

## Standard Component Template

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
  const { t } = useTranslation();
  const someValue = useAppConfig(c => c.layout.someValue);
  const setConfig = useAppSetConfig();

  const handleAction = useCallback(() => {
    setConfig({ layout: { ...config.layout, someValue: newValue } });
  }, [setConfig]);

  return <div>{t('module.key')}</div>;
});

MyComponent.displayName = 'MyComponent';
```

## Rules

### Component Definition

- Use `memo()` with an arrow function: `export const X = memo((...) => { ... })`
- Set `ComponentName.displayName = 'ComponentName'` for DevTools
- Every component preceded by a comment delimiter block (`//*****...`)
- Props defined as a `type` export directly above the component with JSDoc per prop
- Do NOT use `React.FC` or `React.FunctionComponent` type annotations
- Do NOT use default exports
- For generic components: use `function` keyword + `memo(forwardRef(...))` with type cast

### Props

- Props are for **configuration** — how to render (variant, size, disabled)
- Props are NOT for **data** — what to render comes from hooks/stores
- Keep prop interfaces small (< 5 props ideally)
- If a component needs data from the store, read it directly with `useAppConfig`

### State Access

- Read global state: `useAppConfig(c => c.some.path)`
- Write global state: `useAppSetConfig()` → returns setter function
- For nested updates, spread intermediate objects:

```typescript
setConfig({
  layout: {
    ...currentConfig.layout,
    notifications: {
      ...currentConfig.layout.notifications,
      open: true
    }
  }
});
```

### Mutations (API calls)

- Use `useAPIMutation` directly in the component — inline
- Do NOT create a custom hook unless the same mutation is used in 3+ components
- Handle `onSuccess` inline (invalidate queries, update config)

```typescript
const handleSave = useAPIMutation(
  (body: SavePayload) => ({
    url: '/api/v4/resource/',
    method: 'POST',
    body,
    onSuccess: () => {
      invalidateAPIQuery(({ url }) => url.startsWith('/api/v4/resource/'));
    },
  })
);
```

### Event Handlers

- ALL component-internal functions must use `useCallback`
- Name handlers `handle<Action>` (e.g., `handleClick`, `handleClose`)
- Prop callbacks use `on<Action>` (e.g., `onClose`, `onChange`)

### Hook Ordering

Inside a component, hooks follow this strict order:
1. Library hooks (i18next, router, MUI theme)
2. App/core hooks (store, API)
3. `useState` (rare — local ephemeral state only)
4. `useRef`
5. `useMemo`
6. `useMediaQuery`
7. `useCallback` (event handlers)
8. `useEffect` (last resort)

### Conditional Rendering

- Ternary for either/or rendering
- `&&` for show-or-nothing
- Never early return — always return a single JSX expression

```typescript
// ✅ Ternary
{isLoading ? <Spinner /> : <Content />}

// ✅ &&
{error && <ErrorMessage error={error} />}

// ❌ Never early return
if (isLoading) return <Spinner />;
```

## Anti-Patterns (Do NOT Generate)

```typescript
// ❌ Wrapper hook for single-use logic
const useMyComponentLogic = () => { ... };

// ❌ Props for store data
<MyComponent user={user} config={config} />

// ❌ Default export
export default MyComponent;

// ❌ React.FC type
const MyComponent: React.FC<Props> = () => { ... };

// ❌ MUI sx prop
<Box sx={{ p: 2, display: 'flex' }} />

// ❌ MUI layout components
<Stack direction="row"><Box>...</Box></Stack>

// ❌ Inline object/array creation in JSX (causes re-renders)
<Child style={{ margin: 8 }} items={[1, 2, 3]} />

// ❌ Early return for conditional rendering
if (!data) return null;

// ❌ Missing displayName
export const Foo = memo(() => { ... });
```
