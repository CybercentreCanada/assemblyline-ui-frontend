# Features/Search-Params

## 1. Purpose

Provides typed tools for defining, reading, and updating page parameters stored in a URL query string, router state, or in memory.

## 2. Features

- **Typed parameters** - Define parameter names, value types, and defaults in one place.
- **Multiple value types** - Supports booleans, numbers, strings, enums, filter lists, and structured objects.
- **Router integration** - Reads parameter values from the current location and updates the URL or router state when values change.
- **Compact URLs** - Writes values that differ from their defaults.
- **Saved defaults** - Stores user-selected defaults in `localStorage` when a storage key is provided.
- **Snapshots** - Provides a typed snapshot with helpers for reading, updating, and serializing values.

## 3. Concepts

### Blueprint

A blueprint defines one parameter, including its default value, value type, and source. Create blueprints with `SEARCH_PARAM_BLUEPRINTS_MAP`:

| Blueprint | Value type                   | Description                                                                                                                   |
| --------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `boolean` | `boolean`                    | Reads and writes true or false values.                                                                                        |
| `number`  | `number`                     | Reads and writes numeric values; can clamp them to a range.                                                                   |
| `string`  | `string`                     | Reads and writes text values.                                                                                                 |
| `enum`    | One of the provided values   | Reads and writes a choice from a list of strings, numbers, or booleans.                                                       |
| `filters` | `string[]`                   | Reads and writes a list of filter expressions.                                                                                |
| `object`  | A structured object or array | Reads and writes structured values as JSON. Partial objects are combined with their defaults; arrays are replaced as a whole. |

Blueprints also support settings such as `.source()`, `.ephemeral()`, `.ignored()`, `.locked()`, and `.nullable()`.

### Parameter Sources

Use `.source()` to choose where a parameter is stored:

| Source        | Stored value                               |
| ------------- | ------------------------------------------ |
| `'search'`    | The URL query string. This is the default. |
| `'state'`     | React Router location state.               |
| `'transient'` | The current in-memory search snapshot.     |

### Snapshot

`SearchParamSnapshot` contains the current typed values. It provides helpers such as `get`, `has`, `pick`, `omit`, `set`, and `toObject`. It can also serialize values as query parameters or router state.

### Provider and Hook

`SearchParamsProvider` connects a page's blueprint map to the current router location. `useSearchParams` reads the current snapshot and provides methods to update values or save defaults.

## 4. Configuration

### Define Parameters

```typescript
import { createSearchParams } from 'features/search-params';

const ALERT_PARAMS = createSearchParams(blueprints => ({
  page: blueprints.number(1).min(1),
  query: blueprints.string(''),
  sort: blueprints.enum('date', ['name', 'date', 'score'] as const),
  filters: blueprints.filters([])
}));
```

The parameter names and value types are inferred from the blueprint map.

### Blueprint Settings

| Setting                                       | Effect                                                 |
| --------------------------------------------- | ------------------------------------------------------ |
| `.defaultValue(value)`                        | Changes the parameter's default.                       |
| `.source('search' \| 'state' \| 'transient')` | Chooses where the value is stored.                     |
| `.min(value)` / `.max(value)`                 | Sets number bounds. Values are clamped to the range.   |
| `.options(values)`                            | Updates the choices for an enum.                       |
| `.not(prefix)` / `.omit(prefix)`              | Sets filter-expression prefixes.                       |
| `.nullable()`                                 | Allows `null` as a value.                              |
| `.ephemeral()`                                | Excludes the parameter from saved defaults.            |
| `.ignored()`                                  | Excludes the parameter from snapshot change detection. |
| `.locked()`                                   | Resolves the parameter to its default.                 |

## 5. Usage

### Provide Parameters to a Page

```typescript
import { SearchParamsProvider } from 'features/search-params';

<SearchParamsProvider params={ALERT_PARAMS} storageKey="alerts-search">
  <AlertsPage />
</SearchParamsProvider>
```

The `storageKey` enables saving user defaults for this page.

### Read and Update Values

```typescript
import { useSearchParams } from 'features/search-params';

const { search, setSearchObject, setSearchParams } = useSearchParams();
const values = search.toObject();

const page = values.page; // number
const sort = values.sort; // 'name' | 'date' | 'score'

// Use these callbacks in event handlers.
const updatePage = () => setSearchObject({ ...values, page: 2 });

const updateFromQuery = () => setSearchParams(new URLSearchParams('page=3&sort=name'));
```

Updates are reflected in the current snapshot and stored according to each parameter's source.

### Save User Defaults

```typescript
const { setDefaultParams, clearDefaultParams } = useSearchParams();

setDefaultParams({ page: 1, query: '', sort: 'date', filters: [] });
clearDefaultParams();
```

Saved defaults are stored in `localStorage` under the provider's `storageKey`. Parameters marked with `.ephemeral()` are left out.

## 6. Codebase (Internals)

### Key Files

| File                           | Role                                                                 |
| ------------------------------ | -------------------------------------------------------------------- |
| `search-params.models.tsx`     | Parameter, blueprint, source, and inferred-value types.              |
| `search-params.blueprints.tsx` | Blueprint classes and the `SEARCH_PARAM_BLUEPRINTS_MAP` factories.   |
| `search-params.engines.tsx`    | Resolves values from blueprints, locations, and snapshots.           |
| `search-params.snapshots.tsx`  | Typed value snapshots and serialization helpers.                     |
| `search-params.stores.tsx`     | `createSearchParams`, `SearchParamsProvider`, and `useSearchParams`. |
| `search-params.runtimes.tsx`   | Runtime wrappers used by the engine.                                 |
| `index.ts`                     | Public exports for the module.                                       |

### Type Inference

`InferSearchParamValueMapFromBlueprintMap<Blueprints>` derives the value type for every key in a blueprint map. The same inferred types are used by the engine, snapshots, and store update methods.

### Data Flow

`createSearchParams` builds a typed blueprint map. `SearchParamsProvider` uses the map to resolve values from the current location and expose them through `useSearchParams`. Updates create a new snapshot and write the relevant values to the query string or router state. When a storage key is configured, saved user defaults are loaded from and written to `localStorage`.
