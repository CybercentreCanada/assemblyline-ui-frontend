# Features/Path-Params

## 1. Purpose

Type-safe reading and writing of URL path parameters for one path definition. The module derives parameter keys from a path literal, parses typed values out of a `Location.pathname`, and stringifies typed values back into a pathname. It does not match routes, validate path definitions, or decide which route a pathname belongs to; that is left to the router.

## 2. Features

- **Typed parameter keys** - Derives keys from the `:param` segments of a path literal
- **Blueprint-based parsing** - Supports string, number, boolean, and enum parameter values
- **Positional extraction** - Reads each parameter from the pathname segment at the same position as in the definition; static segments are not compared
- **Default values** - Resolves a missing or empty segment, and a value a blueprint does not recognize, to the configured default
- **URL encoding** - Decodes segments during parsing, keeping malformed escapes as literal text, and encodes values during serialization
- **No value validation** - Values are written as the blueprint serializes them, including empty, `.` and `..` values; the only error is a `URIError` for text that cannot be encoded

## 3. Concepts

### Path Definition

A path definition is a plain string such as `/alerts/:id/:tab`. A segment that starts with `:` is a parameter and its key is everything after the colon. Every other segment is static. A colon inside a segment, such as `version:latest`, does not define a parameter.

The definition is only a template. Parsing pairs definition segments with pathname segments by position, so `/alerts/:id` reads `abc` from `/alerts/abc`, from `/other/abc` and from `/alerts/abc/extra`. Whether a pathname belongs to a route is decided elsewhere. A trailing slash in the pathname is ignored, and a trailing slash in the definition is kept when stringifying.

The module does not validate the definition: repeated parameter names, wildcards, `?` suffixes and special characters in a name are treated as plain text.

### Blueprint

`InferPathParamBlueprintFromValue<Value>` defines how one path parameter is handled:

- `type` is a representative value used for type inference.
- `parse(value)` converts a decoded segment into the typed value; it receives `undefined` when the segment is missing or empty and returns the default.
- `stringify(value)` converts the typed value into a path segment.

### Blueprint Map

`InferPathParamBlueprintMapFromPath<Path>` maps every parameter key extracted from `Path` to a blueprint. A path without parameters resolves to `never`. Every entry returned by the codec's blueprint callback must be a path-param blueprint.

### Codec

`InferPathParamCodecFromPath<Path>` describes the codec returned by `createPathParamsCodec`. The runtime codec contains:

- `blueprints` - The configured parameter blueprints
- `type` - A typed object used for inference
- `parse(location)` - Reads and converts values from `location.pathname`; it never throws and never reports a mismatch
- `stringify(params)` - Replaces every `:param` segment with its encoded value, so every parameter must be supplied

## 4. Configuration

### Available Blueprint Types

| Blueprint                     | Default     | Behavior                                                                  |
| ----------------------------- | ----------- | ------------------------------------------------------------------------- |
| `string(defaultValue?)`       | `''`        | Returns the decoded segment or the default when it is missing             |
| `number(defaultValue?)`       | `0`         | Converts the segment with `Number`, using the default for invalid numbers |
| `boolean(defaultValue?)`      | `false`     | Converts `true`/`1` to `true` and `false`/`0` to `false`                  |
| `enum(values, defaultValue?)` | `values[0]` | Returns a matching value or the default                                   |

Distinct enum options must not share a string representation, so `[1, '1']` is rejected when the blueprint is created.

### Creating A Codec

```typescript
import { createPathParamsCodec } from 'features/path-params';

const codec = createPathParamsCodec('/alerts/:id/:tab')(blueprints => ({
  id: blueprints.string(),
  tab: blueprints.enum(['overview', 'history'] as const, 'overview')
}));
```

The path literal determines the required blueprint keys. Each key must have a matching blueprint in the callback result, and every callback entry must be a blueprint.

## 5. Usage

Codecs accept a React Router `Location` and return an object containing the parsed parameters:

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
// values: { id: '123', tab: 'history' }

const pathname = codec.stringify({ id: '456', tab: 'overview' });
// pathname: '/alerts/456/overview'
```

Missing or unrecognized segments use the blueprint default:

```typescript
codec.parse({ ...location, pathname: '/alerts/123' });
// { id: '123', tab: 'overview' }
```

Route components can parse the current React Router location directly with the codec defined above:

```typescript
import { useLocation } from 'react-router';

const AlertPage = () => {
  const { id } = codec.parse(useLocation());
  return <div>{id}</div>;
};
```

## 6. Codebase (Internals)

### Key Files

| File                        | Role                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `path-params.models.ts`     | Public path, blueprint, inferred-value, and codec types, plus the internal pattern types |
| `path-params.utils.ts`      | Blueprint factories, standalone parsing and serialization helpers, and codec creation    |
| `path-params.utils.test.ts` | Unit tests for blueprints, every helper, and codec parsing and serialization             |
| `index.ts`                  | Explicit public exports                                                                  |

### Type Utilities

| Type                                               | Purpose                                        |
| -------------------------------------------------- | ---------------------------------------------- |
| `PathParamValue`                                   | Allowed string, number, and boolean values     |
| `InferPathParamKeyFromPath<Path>`                  | Extracts parameter keys from a path literal    |
| `InferPathParamBlueprintFromValue<Value>`          | Defines one parameter blueprint                |
| `InferPathParamBlueprintMapFromPath<Path>`         | Maps extracted keys to blueprints              |
| `InferPathParamValuesFromBlueprintMap<Blueprints>` | Resolves blueprint values into an object type  |
| `InferPathParamCodecFromPath<Path>`                | Describes the inferred codec type for a path   |
| `PathPattern`                                      | A path definition split once into segments     |
| `PathPatternSegment`                               | One static or `:param` segment of a definition |

### Data Flow And Boundaries

The input boundary is a route `Location` and its pathname. The codec splits the definition once. For each parameter it takes the pathname segment at the same index, decodes it with malformed escapes kept literally, and passes it to the blueprint parser; a missing or empty segment is passed as `undefined`. Serialization passes each value through its blueprint and URI-encodes it into one path segment. It reads only own properties of the supplied values and blueprints, and returns static segments unchanged.

### Implementation Overview

`createPathParamsCodec` parses the definition once into a `PathPattern`, then delegates each call to standalone helpers in `path-params.utils.ts`. Each helper does one step so it can be unit tested on its own.

| Step          | Helpers                                                                                | Responsibility                                       |
| ------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Shared        | `decodePathSegment`, `getOwnValue`                                                     | Decode segments and read only own properties         |
| Pattern       | `parsePathPattern`, `splitPathname`                                                    | Split the definition and the pathname into segments  |
| Extraction    | `extractPathParams`                                                                    | Read the decoded value of each parameter by position |
| Serialization | `stringifyPathPattern`, `serializePathSegments`, `serializePathParam`, `joinPathParts` | Encode values and build the pathname                 |
