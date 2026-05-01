# core/preference

User preference store — **user-owned, persisted to localStorage (and eventually backend)**.

## Purpose

Holds values that the user controls about how the app looks and behaves for them. These are distinct from system config (backend-defined, read-only) and session state (ephemeral, module-owned).

## How It Works

1. The app defines a Zod schema (`AppPreferenceSchema`) in `app/core.preference.tsx` using `.catch()` on every field so invalid values fall back to defaults instead of throwing.
2. `AppPreferenceProvider` receives the `schema` and `storageKey` as props.
3. On mount, the provider hydrates the store by calling `loadPreferenceFromLocalStorage` which parses stored data through the schema — missing or invalid fields are replaced with defaults.
4. An internal `AppPreferencePersistence` component subscribes to the full store and auto-saves to localStorage on every change (skipping the initial hydration).
5. Only the **diff** against schema defaults is stored in localStorage — not the full object. This keeps storage minimal and allows defaults to evolve without stale overrides.

## Persistence Strategy

- **Save**: Computes a deep diff between current state and `schema.parse({})` defaults. Only changed values are written to localStorage. If everything matches defaults, the key is removed entirely.
- **Load**: Reads the stored diff from localStorage and passes it through `schema.parse()`. The `.catch()` validators on each field fill in defaults for any missing or invalid values, producing a complete `AppPreference` object.

## Key Files

| File | Purpose |
| ---- | ------- |
| `preference.providers.tsx` | Store creation, `AppPreferenceProvider`, `AppPreferencePersistence` |
| `preference.utils.ts` | `savePreferenceToLocalStorage`, `loadPreferenceFromLocalStorage`, `deepDiff` |
| `preference.utils.test.ts` | Unit tests for persistence utilities |
| `index.ts` | Barrel exports |

## Exports

| Export | Description |
| ------ | ----------- |
| `useAppPreference(selector)` | Read a slice of preference with selector-based subscriptions |
| `useAppSetPreference()` | Returns a setter to shallow-merge a patch into preference |
| `AppPreferenceProvider` | Mount at app root with `schema` + `storageKey` props |

## Usage

```tsx
// app/app.tsx
import { AppPreferenceProvider } from 'core/preference';
import { AppPreferenceSchema } from './core.preference';

const APP_PREFERENCES_KEY = 'al.preference';

<AppPreferenceProvider schema={AppPreferenceSchema} storageKey={APP_PREFERENCES_KEY}>
  <App />
</AppPreferenceProvider>
```

```tsx
// Reading in a component
const lang = useAppPreference(s => s.layout.lang);
const density = useAppPreference(s => s.layout.density);
```

```tsx
// Writing in a component
const setPrefs = useAppSetPreference();
setPrefs(prev => ({ ...prev, layout: { ...prev.layout, lang: 'fr' } }));
```

## Global Type

The `AppPreference` type is declared globally via `declare global` in `app/core.preference.tsx`, inferred from the Zod schema (`z.infer<typeof AppPreferenceSchema>`). This makes it available everywhere without imports.

## Schema Design

Each field uses `.catch(defaultValue)` instead of `.default(defaultValue)`:

- `.default()` — fills in when value is `undefined`
- `.catch()` — fills in when value is `undefined` **or** validation fails

This makes the schema resilient to corrupted localStorage data — invalid values silently fall back to defaults instead of throwing `ZodError`.
