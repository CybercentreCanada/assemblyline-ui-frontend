# Features/Hash-Params

## 1. Purpose

The Hash Params module reads and writes one typed value in a URL hash fragment. It provides string and enum blueprints and a codec that works with React Router locations.

## 2. Features

- **Typed values** - Configure string values or a fixed set of string, number, or boolean options
- **Defaults** - Use a default value when the hash is empty or does not match an enum option
- **URL encoding** - Decode values when parsing and encode them when creating a hash
- **Typed codec** - Parse a location's hash or serialize a value as a hash fragment

## 3. Concepts

### Blueprint

A blueprint defines how a hash value is parsed and serialized. `HASH_PARAM_BLUEPRINTS` provides:

- `string(defaultValue?)` for any non-empty string
- `enum(values, defaultValue?)` for one of a fixed set of string, number, or boolean values

String blueprints default to `''`. Enum blueprints have no default unless one is provided.

### Codec

`createHashParamCodec` creates a codec for a blueprint. The codec exposes:

- `parse(location)` to read and convert the location's hash
- `stringify(value)` to serialize a value as a hash fragment
- `blueprint` and `type` to access the configured blueprint and its representative value

### Hash value

`HashParamValue` is a string, number, or boolean. `InferHashParamFromBlueprint` and `InferHashParamCodecFromBlueprint` derive value and codec types from a blueprint.

## 4. Configuration

| Blueprint                     | Default     | Parsing behavior                                                           |
| ----------------------------- | ----------- | -------------------------------------------------------------------------- |
| `string(defaultValue?)`       | `''`        | Returns the decoded value, or the default for an empty hash                |
| `enum(values, defaultValue?)` | `undefined` | Returns the matching option, or the default for an empty or unmatched hash |

Enum options must have unique string representations. An empty string option is allowed only when it is also the configured default, because an empty hash represents the default.

Create a codec by providing the value type and selecting a blueprint:

```typescript
import { createHashParamCodec } from 'features/hash-params';

const sections = ['overview', 'installation', 'usage'] as const;
type Section = (typeof sections)[number];

const sectionCodec = createHashParamCodec<Section>()(blueprints => blueprints.enum(sections, 'overview'));
```

## 5. Usage

Pass a React Router `Location` to `parse`. The result type includes `undefined`, even when a default is configured. Pass a value to `stringify` to create the corresponding hash:

```typescript
import type { Location } from 'react-router';

const location: Location = {
  pathname: '/docs',
  search: '',
  hash: '#installation',
  state: null,
  key: 'default'
};

const section = sectionCodec.parse(location);
// section: Section | undefined

const hash = sectionCodec.stringify('usage');
// hash: '#usage'
```

Parsing removes one leading `#`, decodes the fragment, and passes the result to the blueprint. A malformed encoded value is passed through as literal text. Stringifying omits empty or default values; other values are URL-encoded and prefixed with `#`. Encoding malformed Unicode can throw `URIError`.

## 6. Codebase (Internals)

### Key Files

| File                        | Role                                        |
| --------------------------- | ------------------------------------------- |
| `hash-params.models.ts`     | Public value, blueprint, and codec types    |
| `hash-params.utils.ts`      | Blueprint factories and codec creation      |
| `hash-params.utils.test.ts` | Unit tests for blueprint and codec behavior |
| `index.ts`                  | Explicit public exports                     |

### Public Types

| Type                                          | Purpose                                    |
| --------------------------------------------- | ------------------------------------------ |
| `HashParamValue`                              | Allowed string, number, and boolean values |
| `HashParamBlueprintKind`                      | Identifies a string or enum blueprint      |
| `InferHashParamBlueprintFromValue<Value>`     | Describes one hash blueprint               |
| `InferHashParamFromBlueprint<Blueprint>`      | Derives a blueprint's value type           |
| `InferHashParamCodecFromBlueprint<Blueprint>` | Describes the codec for a blueprint        |

### Data Flow And Boundaries

The codec reads `location.hash`, removes its leading `#` when present, and decodes the remaining text before passing it to the blueprint. String blueprints return the decoded text or their default; enum blueprints return a matching option or their default. If URI decoding fails, the original text is passed to the blueprint.

When serializing, the codec applies the blueprint's serializer. Empty output becomes an empty string; other output is URI-encoded and returned with a leading `#`.
