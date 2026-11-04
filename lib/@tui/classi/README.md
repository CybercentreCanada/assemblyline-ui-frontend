# `@tui/classi`

Classification banner module for TemplateUI v4.

Applications handling government information usually have to say, on screen, what level of information the user is
looking at. This module provides that: a classification chip you can drop into the top navigation, plus a companion
chip for Traffic Light Protocol designations.

The classification can be fixed at deploy time or fetched from an endpoint, so the same build can run at different
levels.

The module namespace is `tui.classi` — see [MODULE_NAME](src/name.ts). Everything public is exported from
[src/index.ts](src/index.ts).

## Install

Point npm at the BoH registry:

```ini
# ~/.npmrc
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

Then install:

```bash
pnpm add @tui/classi
```

## Setting it up

### Register translations

The module ships `en` and `fr` strings. Register them on your i18n instance before anything renders, or the chip will
show raw keys:

```ts
import { addTranslations as addClassiTranslations } from '@tui/classi';
import i18n from './i18n';

addClassiTranslations(i18n);
```

### Mount the provider

Decide where the classification comes from. If it is known when you deploy, pass it directly:

```tsx
<AppClassificationProvider value="pb">{children}</AppClassificationProvider>
```

If one build serves several environments, point the provider at an endpoint instead and let it fetch:

```tsx
<AppClassificationProvider url="/api/classification">{children}</AppClassificationProvider>
```

The endpoint returns the value as JSON:

```json
{ "value": "pb" }
```

Pass one or the other. If you pass both, `value` wins and the `url` is never called — a quiet trap worth remembering.

The provider belongs with your other module providers, between `AppRoot` and `AppProvider` — see
[Optional modules](../../docs/configuration.md#optional-modules).

### Render the chip

`AppClassification` reads from context, so it needs no props. The usual home for it is a top-nav slot:

```tsx
import { AppClassification } from '@tui/classi';
import type { AppPreferenceConfigs } from '@tui/core';

export const preferences: AppPreferenceConfigs = {
  topnav: {
    slots: {
      right: [<AppClassification key="classification" />]
    }
  }
};
```

It adapts on its own: abbreviated text on small screens, the full label and a security icon on larger ones.

To show a different level for one part of the page without touching global state, pass `overwrite`:

```tsx
<AppClassification overwrite="s" />
```

## The values

| Value | Meaning      |
| ----- | ------------ |
| `u`   | Unclassified |
| `pa`  | Protected A  |
| `pb`  | Protected B  |
| `pc`  | Protected C  |
| `c`   | Confidential |
| `s`   | Secret       |
| `ts`  | Top Secret   |

Two qualifiers are also defined — `ouo` (for official use only) and `cic` (Canadian eyes only) — exported as
`AppClassificationQualifiers`.

Alongside the seven values, the chip has two states it can be in while resolving a `url`: `loading` and `error`. That
is why the type you read from the hook is `AppClassificationState` (the values plus those two) rather than
`AppClassificationValue`.

```ts
type AppClassificationValue = 'u' | 'pa' | 'pb' | 'pc' | 'c' | 's' | 'ts';
type AppClassificationQualifier = 'ouo' | 'cic';
type AppClassificationState = AppClassificationValue | 'loading' | 'error';
```

The runtime arrays `AppClassificationValues`, `AppClassificationQualifiers`, and `AppClassificationStates` are exported
too, which is handy for building dropdowns.

## Changing it at runtime

`useAppClassification` gives you the current state and a setter:

```tsx
const { value, setValue } = useAppClassification();
```

See the [classification hooks reference](../../docs/reference/hooks/classi.md) for the full signature.

## Traffic Light Protocol

`AppTLP` is a separate chip for sharing designations. It takes its value as a prop rather than from context, since TLP
usually applies to a specific piece of content rather than the whole application:

```tsx
<AppTLP value="TLP:AMBER" />
```

| Value       | Colour |
| ----------- | ------ |
| `TLP:RED`   | Red    |
| `TLP:AMBER` | Orange |
| `TLP:GREEN` | Green  |
| `TLP:CLEAR` | White  |

The colour mapping is exported as `TLP_SCHEMA` if you need to match it elsewhere.

Both chips accept MUI margin props (`m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my`) through `mx` for spacing.

## Troubleshooting

| Symptom                     | Likely cause                                                                     |
| --------------------------- | -------------------------------------------------------------------------------- |
| The chip shows raw keys     | `addTranslations` was never called, or ran after the first render                |
| The `url` is never fetched  | A `value` prop is also set, and it takes precedence                              |
| The chip reads `error`      | The response does not match `{ "value": "pb" }`, or the value is not a known one |
| The chip stays on `loading` | The request is failing — check the Network tab and the endpoint's CORS headers   |

## Related

- **[Classification hooks reference](../../docs/reference/hooks/classi.md)** — the `useAppClassification` signature.
- **[Configuration](../../docs/configuration.md)** — where module providers and top-nav slots belong.
- **[`@tui/core`](../core/README.md)** — the shell this module plugs into.
