# Features/Path-Params

## 1. Purpose

Provides typed codecs for reading path parameter values from a React Router `Location` and serializing typed values into a pathname.

## 2. Features

- **Typed parameter keys** - Derives parameter keys from a path literal.
- **Typed blueprints** - Parses and serializes string, number, boolean, and enum values.
- **Path extraction** - Reads each parameter from the corresponding pathname segment.
- **Default values** - Uses a blueprint's default for missing, empty, or unrecognized values. Defaults to `null` when omitted.
- **URL encoding** - Decodes parameter segments when parsing and encodes them when serializing. Malformed escapes are preserved as literal text.
- **Safe parameter records** - Supports names such as `__proto__` as own properties.

## 3. Concepts

### Path Definition

A path definition is a slash-delimited string. A segment beginning with `:` defines a parameter; the text after the colon is its key. Other segments are static text.

```typescript
'/alerts/:id/:tab';
```

### Blueprint

`InferPathParamBlueprintFromValue<Value>` describes how one parameter is converted:

- `type` is a representative value for type inference.
- `parse(value)` converts a decoded segment into its typed value.
- `stringify(value)` converts a typed value into a URL-safe segment.

### Blueprint Map

`InferPathParamBlueprintMapFromPath<Path>` maps the keys in a path definition to their blueprints. The codec builder requires a blueprint for each parameter key.

### Codec

`InferPathParamCodecFromPath<Path>` describes the codec returned by `createPathParamsCodec`. It contains:

- `blueprints` - The configured parameter blueprints.
- `type` - A typed value object for inference.
- `parse(location)` - Reads parameter segments from `location.pathname` and converts them with the configured blueprints.
- `stringify(params)` - Serializes parameter values and combines them with the static path segments.

## 4. Configuration

### Available Blueprints

| Blueprint      | Default | Parsing behavior                                                   |
| -------------- | ------- | ------------------------------------------------------------------ |
| `string`       | `null`  | Returns the decoded segment.                                       |
| `number`       | `null`  | Converts with `Number`; uses the default when the result is `NaN`. |
| `boolean`      | `null`  | Converts `true` and `1` to `true`, and `false` and `0` to `false`. |
| `enum(values)` | `null`  | Returns the selected value from the provided options.              |

An explicit default can be supplied when creating a blueprint. When omitted, the default is `null`. Missing, empty, and unrecognized segments resolve to the default.

String, number, and boolean blueprints serialize `null` and `undefined` as empty segments. Enum blueprints serialize nullish or unrecognized values as their configured default, or as an empty segment when the default is `null`.

### Creating a Codec

```typescript
import { createPathParamsCodec } from 'features/path-params';

const codec = createPathParamsCodec('/alerts/:id/:tab')(blueprints => ({
  id: blueprints.string(),
  tab: blueprints.enum(['overview', 'history'] as const, 'overview')
}));
```

The path literal provides the required blueprint keys and determines the parsed value types.

## 5. Usage

```typescript
import type { Location } from 'react-router';

const location: Location = {
  hash: '',
  key: 'default',
  pathname: '/alerts/123/history',
  search: '',
  state: null
};

const values = codec.parse(location);
// { id: '123', tab: 'history' }

const pathname = codec.stringify({ id: '456', tab: 'overview' });
// '/alerts/456/overview'
```

When a segment is missing or its value is not recognized, the blueprint default is used:

```typescript
codec.parse({ ...location, pathname: '/alerts/123' });
// { id: '123', tab: 'overview' }
```

## 6. Codebase (Internals)

### Key Files

| File                        | Role                                                                             |
| --------------------------- | -------------------------------------------------------------------------------- |
| `path-params.models.ts`     | Path, blueprint, inferred-value, and codec types.                                |
| `path-params.utils.ts`      | Blueprint factories, path extraction, serialization helpers, and codec creation. |
| `path-params.utils.test.ts` | Tests for blueprints, helpers, parsing, and serialization.                       |
| `index.ts`                  | Explicit public exports.                                                         |

### Public Types

| Type                                               | Purpose                                                  |
| -------------------------------------------------- | -------------------------------------------------------- |
| `RoutePath`                                        | React Router path string type.                           |
| `PathParamValue`                                   | String, number, or boolean parameter value.              |
| `PathParamBlueprintKind`                           | Identifies a string, number, boolean, or enum blueprint. |
| `InferPathParamKeyFromPath<Path>`                  | Extracts parameter keys from a path literal.             |
| `InferPathParamBlueprintFromValue<Value>`          | Describes one parameter blueprint.                       |
| `InferPathParamBlueprintMapFromPath<Path>`         | Maps path parameter keys to blueprints.                  |
| `InferPathParamValuesFromBlueprintMap<Blueprints>` | Resolves a blueprint map to its parsed value type.       |
| `InferPathParamCodecFromPath<Path>`                | Describes the codec type for a path.                     |
| `PathPattern`                                      | A path definition split into segments.                   |
| `PathPatternSegment`                               | A static or parameter segment.                           |

### Data Flow

`createPathParamsCodec` splits the path definition once. When parsing, it reads each parameter's pathname segment by position, decodes it, and passes it to the blueprint. When serializing, it passes each parameter through its blueprint, URI-encodes the resulting segment, and combines it with the unchanged static segments. Parsed parameter objects use a null prototype, and only own properties are read from parameter and blueprint objects.
