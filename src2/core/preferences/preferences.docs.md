# core/preferences

User preferences store — **user-owned, persisted to localStorage (and eventually backend)**.

## Purpose

Holds values that the user controls about how the app looks and behaves for them. These are distinct from system config (backend-defined, read-only) and session state (ephemeral, module-owned).

## How It Works

1. The app defines a Zod schema (`AppPreferencesSchema`) in `app/core.preferences.tsx` using `.catch()` on every field so invalid values fall back to defaults instead of throwing.
2. `AppPreferencesProvider` receives the `schema` and `storageKey` as props.
3. On mount, the provider hydrates the store by calling `loadPreferencesFromLocalStorage` which parses stored data through the schema — missing or invalid fields are replaced with defaults.
4. An internal `AppPreferencesPersistence` component subscribes to the full store and auto-saves to localStorage on every change (skipping the initial hydration).
5. Only the **diff** against schema defaults is stored in localStorage — not the full object. This keeps storage minimal and allows defaults to evolve without stale overrides.

## Persistence Strategy

- **Save**: Computes a deep diff between current state and `schema.parse({})` defaults. Only changed values are written to localStorage. If everything matches defaults, the key is removed entirely.
- **Load**: Reads the stored diff from localStorage and passes it through `schema.parse()`. The `.catch()` validators on each field fill in defaults for any missing or invalid values, producing a complete `AppPreferences` object.

## Key Files

| File | Purpose |
| ---- | ------- |
| `preferences.providers.tsx` | Store creation, `AppPreferencesProvider`, `AppPreferencesPersistence` |
| `preferences.utils.ts` | `savePreferencesToLocalStorage`, `loadPreferencesFromLocalStorage`, `deepDiff` |
| `preferences.utils.test.ts` | Unit tests for persistence utilities |
| `index.ts` | Barrel exports |

## Exports

| Export | Description |
| ------ | ----------- |
| `useAppPreferences(selector)` | Read a slice of preferences with selector-based subscriptions |
| `useAppSetPreferences()` | Returns a setter to shallow-merge a patch into preferences |
| `AppPreferencesProvider` | Mount at app root with `schema` + `storageKey` props |

## Usage

```tsx
// app/app.tsx
import { AppPreferencesProvider } from 'core/preferences';
import { AppPreferencesSchema } from './core.preferences';

const APP_PREFERENCES_KEY = 'al.preferences';

<AppPreferencesProvider schema={AppPreferencesSchema} storageKey={APP_PREFERENCES_KEY}>
  <App />
</AppPreferencesProvider>
```

```tsx
// Reading in a component
const lang = useAppPreferences(s => s.layout.lang);
const density = useAppPreferences(s => s.layout.density);
```

```tsx
// Writing in a component
const setPrefs = useAppSetPreferences();
setPrefs(prev => ({ ...prev, layout: { ...prev.layout, lang: 'fr' } }));
```

## Global Type

The `AppPreferences` type is declared globally via `declare global` in `app/core.preferences.tsx`, inferred from the Zod schema (`z.infer<typeof AppPreferencesSchema>`). This makes it available everywhere without imports.

## Schema Design

Each field uses `.catch(defaultValue)` instead of `.default(defaultValue)`:

- `.default()` — fills in when value is `undefined`
- `.catch()` — fills in when value is `undefined` **or** validation fails

This makes the schema resilient to corrupted localStorage data — invalid values silently fall back to defaults instead of throwing `ZodError`.
