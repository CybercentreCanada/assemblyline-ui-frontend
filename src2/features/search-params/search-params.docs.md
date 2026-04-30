# Features/Search-Params

## 1. Purpose

Comprehensive URL search parameter management system. Handles typed reading, writing, and persistence of query string parameters with support for multiple value types, delta-based serialization (only non-default values appear in the URL), and resolution from multiple sources (URL, location state, snapshot).

## 2. Features

- **Typed blueprints** — Define each search param with a class-based blueprint (`BooleanBlueprint`, `NumberBlueprint`, `StringBlueprint`, `EnumBlueprint`, `FiltersBlueprint`)
- **Delta serialization** — Only params that differ from their default value are written to the URL, keeping it clean
- **Multi-source resolution** — Params can resolve from `location.search`, `location.state`, or a previous snapshot
- **Immutable snapshots** — Current param state is represented as a frozen `SearchParamSnapshot` with pick/omit/set operations
- **localStorage persistence** — Optional `storageKey` saves user defaults to localStorage and restores them on mount
- **Ephemeral params** — Params marked `ephemeral` are excluded from persistence
- **Ignored params** — Params marked `ignored` don't trigger re-renders when they change
- **Locked params** — Params marked `locked` always resolve to their default regardless of URL input
- **Builder pattern** — Blueprints use fluent chainable methods (`.defaultValue()`, `.ephemeral()`, `.locked()`, `.origin()`)
- **Number clamping** — `NumberBlueprint` supports `.min()` / `.max()` bounds
- **Filter expressions** — `FiltersBlueprint` supports `NOT()` and `!()` prefix wrappers with deduplication

## 3. Concepts

### Blueprint

A class extending `BaseBlueprint<T>` that defines:
- **Key** — The query param name in the URL (e.g., `?page=2` → key = `"page"`)
- **Default value** — What to use when the param is missing or invalid
- **Parse** — Convert a raw string from the URL into the typed value
- **Valid** — Check if a parsed value is acceptable
- **Origin** — Where to resolve the value from (`'search'` | `'state'` | `'snapshot'`)

Available blueprint classes:
| Class | Value type | Notes |
|-------|-----------|-------|
| `BooleanBlueprint` | `boolean` | Parses `'true'`/`'false'` |
| `NumberBlueprint` | `number` | Supports `.min()` / `.max()` clamping |
| `StringBlueprint` | `string` | Direct string passthrough |
| `EnumBlueprint<O>` | `O[number]` | Validates against `.options()` list |
| `FiltersBlueprint` | `string[]` | Handles `NOT()`/`!()` prefix expressions |

### Engine

`SearchParamEngine<Blueprints>` is the orchestrator. Given a map of blueprints, it:
1. Creates a runtime wrapper for each blueprint (exposing protected methods as public)
2. Provides `full(params)` — resolve all params, filling defaults for missing ones
3. Provides `delta(params)` — resolve only non-default params (for minimal URL serialization)
4. Provides `fromLocation(location, snapshot?)` — resolve params from the current browser location

### Snapshot

`SearchParamSnapshot<Blueprints>` is an immutable value object holding the current resolved values. It provides:
- `has(key, value?)` — Check if a param has a valid value (optionally matching a specific value)
- `get(key)` — Get a single param value
- `pick(keys)` / `omit(keys)` — Create a subset snapshot
- `set(input)` — Create a new snapshot with updated values (functional or direct)
- `toLocationSearch()` — Serialize to `?key=value` string (delta of `search`-origin params only)
- `toLocationState()` — Serialize to `location.state` object (delta of `state`-origin params only)
- `toParams()` → `URLSearchParams`
- `toString()` → sorted query string

### Runtime

The `Runtime()` factory wraps a blueprint class, promoting its protected methods (`getDefaultValue`, `full`, `delta`, `fromLocation`, `toParams`, etc.) to public. This separation keeps the blueprint API clean for consumers while giving the engine full access.

### Store

`createSearchParamsStore()` creates a context-based store with:
- A `SearchParamsProvider` that wires up the engine + location sync
- A `useSearchParams` hook that returns the current snapshot + setters
- Uses `useSyncExternalStore` for tear-free reads
- Batches notifications via `queueMicrotask` to prevent cascading renders

## 4. Configuration

### Defining Search Params

```typescript
import { BooleanBlueprint, NumberBlueprint, StringBlueprint, EnumBlueprint, FiltersBlueprint } from 'features/search-params';

const PARAMS = {
  page: new NumberBlueprint().defaultValue(1).min(1),
  rows: new NumberBlueprint().defaultValue(25).min(1).max(100),
  query: new StringBlueprint().defaultValue(''),
  sort: new EnumBlueprint().options(['name', 'date', 'score'] as const).defaultValue('date'),
  filters: new FiltersBlueprint().defaultValue([]),
  showAdvanced: new BooleanBlueprint().defaultValue(false).ephemeral(),
};
```

### Blueprint Options (Builder Methods)

| Method | Effect |
|--------|--------|
| `.defaultValue(v)` | Set the default/fallback value |
| `.ephemeral()` | Exclude from localStorage persistence |
| `.ignored()` | Changes don't trigger snapshot difference detection |
| `.locked()` | Always returns default regardless of URL value |
| `.nullable()` | Allows `null` as a valid value |
| `.origin('search' \| 'state' \| 'snapshot')` | Source for value resolution |
| `.min(n)` / `.max(n)` | Number bounds (NumberBlueprint only) |
| `.options([...])` | Valid values list (EnumBlueprint only) |
| `.not(prefix)` / `.omit(prefix)` | Prefix expressions (FiltersBlueprint only) |

## 5. Usage (Consumer API)

### Providing Search Params to a Route

```typescript
const { SearchParamsProvider, useSearchParams } = createSearchParamsStore();

// In a layout/page:
<SearchParamsProvider params={PARAMS} storageKey="alerts-search">
  <AlertList />
</SearchParamsProvider>
```

### Reading Search Params

```typescript
const { search } = useSearchParams();

const page = search.get('page');        // number
const sort = search.get('sort');        // 'name' | 'date' | 'score'
const hasFilters = search.has('filters'); // boolean
```

### Writing Search Params

```typescript
const { setSearchObject } = useSearchParams();

// Direct update
setSearchObject({ page: 2, sort: 'name' });

// Functional update
setSearchObject(prev => ({ ...prev, page: prev.page + 1 }));

// With replace (no history entry)
setSearchObject({ page: 1 }, true);
```

### Writing via URLSearchParams

```typescript
const { setSearchParams } = useSearchParams();

setSearchParams(new URLSearchParams('page=3&sort=date'));
```

### Persisting User Defaults

```typescript
const { setDefaultParams, clearDefaultParams } = useSearchParams();

// Save current params as user defaults (written to localStorage)
setDefaultParams({ page: 1, rows: 50, sort: 'name' });

// Clear saved defaults
clearDefaultParams();
```

## 6. Codebase (Internals)

### Key Files

| File | Role |
|------|------|
| `search-params.models.tsx` | Type definitions: `ParamValues`, `ParamSource`, `ParamBlueprints`, `InferValue`, `SearchParamValueMap`, `SearchParamRuntimeMap` |
| `search-params.blueprints.tsx` | `BaseBlueprint<T>` abstract class + concrete classes: `BooleanBlueprint`, `NumberBlueprint`, `StringBlueprint`, `EnumBlueprint`, `FiltersBlueprint` |
| `search-params.engines.tsx` | `SearchParamEngine` — orchestrates blueprints into full/delta/fromLocation resolution |
| `search-params.snapshots.tsx` | `SearchParamSnapshot` — immutable value object with has/get/pick/omit/set/toLocationSearch/toLocationState |
| `search-params.runtimes.tsx` | `Runtime()` factory + `PARAM_RUNTIMES` map — promotes protected methods to public |
| `search-params.stores.tsx` | `createSearchParamsStore()` — Context provider + `useSearchParams` hook with `useSyncExternalStore` |
| `index.ts` | Public exports |

### Engine Methods

| Method | Purpose |
|--------|---------|
| `getDefaultValues()` | Snapshot with all defaults |
| `setDefaultValues(params)` | Override defaults from URLSearchParams (used for localStorage restore) |
| `getEphemeralKeys()` | Keys excluded from persistence |
| `getIgnoredKeys()` | Keys excluded from difference detection |
| `getLockedKeys()` | Keys that always return default |
| `full(value)` | Resolve all params, filling defaults |
| `delta(value)` | Resolve only non-default params |
| `fromLocation(location, snapshot?)` | Resolve from browser location |

### Related Modules

- `core/routes/` — Consumes engines via `createAppRoute` to define per-route search params
- `features/path-params/` — Parallel system for path segment params (same philosophy, simpler API)
