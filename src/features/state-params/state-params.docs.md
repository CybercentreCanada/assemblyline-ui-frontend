# Features/State-Params

## 1. Purpose

Typed utilities for defining, merging, cloning, and comparing route state values. The module creates codecs that resolve complete state objects from partial or unknown values while preserving the configured default shape.

## 2. Features

- **Typed state shapes** - Supports primitive values, nested records, and arrays
- **Default reconciliation** - Fills missing values from a configured default object
- **Partial input support** - Accepts partial state values for delta updates
- **Deep comparison** - Compares supported state values recursively
- **Cloning** - Prevents callers from sharing mutable nested state references
- **Delta generation** - Produces only values that differ from the configured defaults

## 3. Concepts

### State Value

`StateParamValue` is a supported state value: a string, number, boolean, `null`, nested record, or array of supported values. `StateParamShape` is a record whose values use this recursive shape.

### Blueprint

`InferStateParamBlueprintFromValue<Value>` defines a complete state shape and provides:

- `type` - The default typed value used for inference
- `full(value)` - Merges an unknown value into the default shape
- `delta(value)` - Computes the values that differ from the default shape

### Codec

`InferStateParamCodecFromBlueprint<Blueprint>` describes the object returned by `createStateParamCodec`. The runtime codec contains:

- `blueprint` - The configured state blueprint
- `type` - A cloned default value used for inference
- `full(location)` - Reads `location.state` and returns a complete state object
- `delta(value)` - Returns a partial state delta or `undefined`

### Full And Delta Values

A full value contains the complete resolved state shape. A delta contains only values that differ from the defaults. Nested records are compared recursively, while arrays are treated as values and replaced as a whole.

## 4. Configuration

### Creating A Blueprint

```typescript
import { createStateParamCodec } from 'features/state-params';

const stateCodec = createStateParamCodec(createBlueprint =>
  createBlueprint({
    view: 'summary',
    filters: {
      severity: 'all',
      includeSuppressed: false
    }
  })
);
```

The callback receives `createStateParamBlueprint`, which creates a blueprint from the supplied default state shape.

### Default Blueprint

`createDefaultStateParamBlueprint` creates an empty fallback blueprint. It returns an empty object from `full` and `undefined` from `delta`.

## 5. Usage

### Resolving Full State From A Location

```typescript
import type { Location } from 'react-router';

const location: Location = {
  hash: '',
  key: 'default',
  pathname: '/items/abc',
  search: '',
  state: {
    filters: { severity: 'high' }
  }
};

const fullState = stateCodec.full(location);
// {
//   view: 'summary',
//   filters: { severity: 'high', includeSuppressed: false }
// }
```

Unknown, null, or non-record state values resolve to a cloned copy of the default shape. Known nested records are merged recursively, and arrays replace the corresponding default array when supplied.

### Creating A State Delta

```typescript
const delta = stateCodec.delta({
  filters: { severity: 'high' }
});

// { filters: { severity: 'high' } }
```

Values equal to their defaults are omitted. When no value differs from the defaults, `delta` returns `undefined`.

### Using Utility Functions Directly

```typescript
import {
  areStateParamValuesEqual,
  cloneStateParamValue,
  mergeStateParamValues
} from 'features/state-params';

const defaults = { view: 'summary', enabled: true } as const;
const merged = mergeStateParamValues(defaults, { view: 'details' });
const same = areStateParamValuesEqual(merged, { view: 'details', enabled: true });
const copy = cloneStateParamValue(merged);
```

The current route factory does not expose `state-params` as a route option. This module can be used directly until route-level state integration is added.

## 6. Codebase (Internals)

### Key Files

| File | Role |
| --- | --- |
| `state-params.models.ts` | State value, shape, blueprint, input, and codec types |
| `state.params.utils.ts` | Cloning, comparison, merge, delta, blueprint, and codec utilities |
| `state.params.utils.test.ts` | Unit tests for the state utilities |
| `index.ts` | Explicit public exports |

### Type Utilities

| Type | Purpose |
| --- | --- |
| `StateParamPrimitive` | Allowed scalar values and `null` |
| `StateParamValue` | Recursive state value type |
| `StateParamShape` | Record-shaped state object |
| `InferStateParamBlueprintFromValue<Value>` | Defines one state blueprint |
| `InferStateParamFromBlueprint<Blueprint>` | Resolves a blueprint to its full value type |
| `InferStateParamInputFromBlueprint<Blueprint>` | Resolves the accepted partial input type |
| `InferStateParamCodecFromBlueprint<Blueprint>` | Describes the inferred codec type |

### Data Flow And Boundaries

The input boundary is an unknown state payload or a React Router `Location`. The full-state path clones the configured defaults and merges valid incoming records into them. The delta path compares incoming values against the defaults and retains only changed values. Invalid shapes fall back to defaults, and cloning prevents nested values from sharing references with the input.

## 7. Related Modules

- `core/router/` - Carries route locations and their `state` values
- `core/routes/` - Owns the current route parameter factory and route location models
- `features/path-params/` - Provides a parallel typed codec for path parameters
- `features/hash-params/` - Provides a parallel typed codec for hash values
