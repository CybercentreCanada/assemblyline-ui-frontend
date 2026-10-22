# Features/Hash-Params

## 1. Purpose

Typed parsing and serialization for a single value in a URL hash fragment. The module defines hash blueprints and creates codecs for reading and writing a React Router `Location` hash.

## 2. Features

- **Single value** - Resolves one string, number, or boolean value rather than an object of values
- **Blueprint-based parsing** - Supports unrestricted strings and fixed enum values
- **URL encoding** - Decodes hash values during parsing and applies URI encoding during serialization
- **Optional defaults** - Returns a configured default or `undefined` for missing and unmatched values
- **Typed codec API** - Preserves the configured blueprint and its parse and stringify types

## 3. Concepts

### Blueprint

`InferHashParamBlueprintFromValue<Value>` defines how one hash value is handled:

- `type` is the representative value used for inference; for an enum it is the first option.
- `parse(value)` converts decoded text to the configured value, or returns `undefined` when no value matches and no default is configured.
- `stringify(value)` converts the typed value into hash-fragment text.

### Codec

`InferHashParamCodecFromBlueprint<Blueprint>` describes the codec returned by `createHashParamCodec`. The runtime codec contains:

- `blueprint` - The configured hash blueprint
- `type` - A typed value used for inference
- `parse(location)` - Reads and converts `location.hash`
- `stringify(value)` - Produces an encoded hash beginning with `#`

Pass the allowed value union as the `Value` type argument to `createHashParamCodec`; the callback does not infer it. If omitted, `Value` widens to `HashParamValue`. `type` retains the blueprint's representative value type, `parse` uses the blueprint parser's return type (including `undefined` where applicable), and `stringify` accepts the blueprint serializer's input type.

### Hash Value

`HashParamValue` allows string, number, and boolean enum values.

## 4. Configuration

### Available Blueprint Types

| Blueprint | Default | Behavior |
| --- | --- | --- |
| `string(defaultValue?)` | `''` | Returns the decoded hash value; uses the default for a missing or empty hash |
| `enum(values, defaultValue?)` | `undefined` | Returns a matching option; uses the default for a missing, empty, or unmatched hash |

Distinct enum options must not share a string representation. For example, `[1, '1']` is rejected because both options serialize to the same hash text.
An empty string option is accepted only when `''` is explicitly configured as the enum default, because an empty hash represents the default value.

### Creating A Codec

```typescript
import { createHashParamCodec } from 'features/hash-params';

type DocumentationSection = 'overview' | 'installation' | 'usage';

const codec = createHashParamCodec<DocumentationSection>()(({ enum: createEnum }) =>
  createEnum(['overview', 'installation', 'usage'])
);
```

The callback receives `HASH_PARAM_BLUEPRINTS`, which exposes the `string` and `enum` blueprint factories. Keep the `Value` union aligned with the blueprint's configured values.

## 5. Usage

Codecs accept a React Router `Location` and return one parsed value:

```typescript
import type { Location } from 'react-router';

const location: Location = {
  hash: '#usage',
  key: 'default',
  pathname: '/docs',
  search: '',
  state: null
};

const value = codec.parse(location);
// value: DocumentationSection | undefined

const hash = codec.stringify(value);
// hash: '#usage'
```

For an enum codec, `value` is `DocumentationSection | undefined`, and `codec.stringify(value)` accepts that same union. The `type` property is the enum's representative value at runtime and is typed as `DocumentationSection`.

## 6. Codebase (Internals)

### Key Files

| File | Role |
| --- | --- |
| `hash-params.models.ts` | Public hash value, blueprint, and codec types |
| `hash-params.utils.ts` | Blueprint factories, default blueprint, and codec creation |
| `hash-params.utils.test.ts` | Unit tests for parsing and serialization |
| `index.ts` | Explicit public exports |

### Type Utilities

| Type | Purpose |
| --- | --- |
| `HashParamValue` | Allowed string, number, and boolean values |
| `InferHashParamBlueprintFromValue<Value>` | Defines one hash blueprint |
| `InferHashParamFromBlueprint<Blueprint>` | Resolves a blueprint to its value type or `undefined` |
| `InferHashParamCodecFromBlueprint<Blueprint>` | Describes the inferred codec type |

### Data Flow And Boundaries

The input is a React Router `Location`. Parsing removes one leading `#`, attempts to decode the fragment, then passes the result to the blueprint parser. A string blueprint uses its default for missing or empty input; an enum uses its configured default or returns `undefined` when the value is missing or unmatched. Serialization runs the blueprint serializer; empty output becomes an empty hash, while non-empty output is passed to `encodeURIComponent` and prefixed with `#`. If the output contains malformed UTF-16, such as a lone surrogate, `encodeURIComponent` throws `URIError` rather than emitting a fragment that cannot round-trip.

## 7. Related Modules

- `features/path-params/` - Provides the parallel typed codec system for path parameters
- `features/search-params/` - Provides the parallel typed codec system for query parameters
