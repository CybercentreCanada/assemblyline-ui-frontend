# Hash Params

Parse and serialize hash fragments to enable navigation to specific anchors within a page (e.g., `#introduction`, `#api-section`, etc.).

## Overview

The hash params codec allows routes to declare which hash fragments (anchor IDs) they accept. Unlike path params which return an object of typed values, hash params return a **single enum value** or `undefined`. This is primarily used for scrolling to and deep-linking to specific sections within a page.

### Key Characteristics

- **Single value**: Returns `Value | undefined`, not an object
- **Enum-based**: Only predefined hash values are accepted
- **Optional**: If no hash blueprint is defined, the route accepts no hash params
- **URL-encoded**: Automatically encodes/decodes hash values
- **Deep-linkable**: URLs with hashes can be bookmarked and shared to jump directly to a section

## API

### Define Hash Params in a Route

```tsx
export const MyPageRoute = createAppRoute({
  component: MyPage,
  route: '/my-page',
  hash: s => s(['introduction', 'api', 'examples', 'faq'])
});
```

The `hash` function receives a factory object with methods to create blueprints:

- `blueprint.enum(values, defaultValue?)` — accepts one of the provided values

### Using Hash Params in Components

```tsx
const hashValue = useAppHashParams<'/my-page'>();
// hashValue: 'introduction' | 'api' | 'examples' | 'faq' | undefined

useEffect(() => {
  if (hashValue) {
    const element = document.getElementById(hashValue);
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}, [hashValue]);
```

### Creating a Codec Manually

```tsx
import { createHashParamCodec } from 'features/hash-params';

const hashCodec = createHashParamCodec()(blueprint =>
  blueprint.enum(['introduction', 'api', 'examples', 'faq'])
);

const value = hashCodec.parse(location);
// value: 'introduction' | 'api' | 'examples' | 'faq' | undefined

const hash = hashCodec.stringify(value);
// hash: '#api' or '#faq' or ''
```

## Examples

### Scrolling to Sections

The primary use case: automatically scroll to a section when the hash changes.

```tsx
export const DocumentationRoute = createAppRoute({
  component: DocumentationPage,
  route: '/docs',
  hash: s => s(['overview', 'installation', 'usage', 'api-reference', 'faq'])
});

function DocumentationPage() {
  const hashValue = useAppHashParams<'/docs'>();

  useEffect(() => {
    if (hashValue) {
      const element = document.getElementById(hashValue);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hashValue]);

  return (
    <div>
      <section id="overview">...</section>
      <section id="installation">...</section>
      <section id="usage">...</section>
      <section id="api-reference">...</section>
      <section id="faq">...</section>
    </div>
  );
}
```

Users can now:
- Visit `/docs#usage` to jump directly to the usage section
- Bookmark `/docs#api-reference` to return to that section later
- Share `/docs#faq` to link others to the FAQ

## Type Inference

The hash param type is automatically inferred from the enum values:

```tsx
const codec = createHashParamCodec()(blueprint =>
  blueprint.enum(['overview', 'installation', 'usage'] as const)
);

// codec.parse() returns: 'overview' | 'installation' | 'usage' | undefined
// codec.type is: 'overview'
```

TypeScript enforces that only declared hash values are allowed:

```tsx
// ✅ Valid
navigate.to().create({ route: '/docs', hash: 'api' });

// ❌ TypeScript error — 'invalid' not in enum
navigate.to().create({ route: '/docs', hash: 'invalid' });
```

## Encoding

Hash values are automatically URL-encoded when stringified and decoded when parsed:

```tsx
const codec = createHashParamCodec()(blueprint =>
  blueprint.enum(['api-overview', 'getting-started'])
);

codec.stringify('api-overview'); // '#api-overview'
// For special characters: '#my%20section' for 'my section'
```

## Design Notes

- **Single responsibility** — hash params handle only hash fragment navigation, not scroll position management
- **No default export** — use named exports for composition
- **No implicit defaults** — pass defaults explicitly to `.enum()`
- **Composable** — codecs are pure functions without side effects
- **Browser-compatible** — uses standard `location.hash` and `encodeURIComponent`
- **Type-safe** — only declared hash values are permitted at compile time
