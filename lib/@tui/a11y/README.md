# `@tui/a11y`

Accessibility module for TemplateUI v4.

This module gives your application a standard set of accessibility controls: a button in the top navigation that opens
a drawer where users can adjust the reading cursor, animation, line height, text size, text spacing, text alignment,
and tooltip delay. Their choices apply immediately as MUI theme overrides.

Reach for it when you want accessibility settings that look and behave the same way across every TemplateUI app, rather
than building your own.

The module namespace is `tui.a11y` — see [MODULE_NAME](src/name.ts). Everything public is exported from
[src/index.ts](src/index.ts).

## Before you start

The accessibility panel renders inside the shared app drawer, so this module depends on
[`@tui/drawer`](../drawer/README.md). Install both, and mount `AppDrawerProvider` above `AppAccessibilityProvider`.

Point npm at the BoH registry:

```ini
# ~/.npmrc
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

Then install:

```bash
pnpm add @tui/a11y @tui/drawer
```

## Setting it up

Three steps: register the translations, mount the providers, and put the button somewhere users can find it.

### Register translations

The module ships its own `en` and `fr` resources. They are not loaded automatically — register them on your i18n
instance before anything renders, or the panel will show raw translation keys:

```ts
import { addTranslations as addA11yTranslations } from '@tui/a11y';
import i18n from './i18n';

addA11yTranslations(i18n);
```

The template app does this in [app/i18n.ts](../template/app/i18n.ts).

### Mount the providers

Order matters. The drawer provider has to be the outer one:

```tsx
import { AppAccessibilityProvider } from '@tui/a11y';
import { AppDrawerProvider } from '@tui/drawer';
import type { PropsWithChildren } from 'react';

export const MyAppProvider = ({ children }: PropsWithChildren) => (
  <AppDrawerProvider>
    <AppAccessibilityProvider>{children}</AppAccessibilityProvider>
  </AppDrawerProvider>
);
```

These belong between `AppRoot` and `AppProvider` — see [Optional modules](../../docs/configuration.md#optional-modules)
for where module providers sit in the shell.

### Add the button

[AppDrawerAccessibilityIconButton](src/components/AppDrawerAccessibility.tsx) opens the panel. Put it in a top-nav
right-side slot so it is reachable from every page:

```tsx
import { AppDrawerAccessibilityIconButton } from '@tui/a11y';
import type { AppPreferenceConfigs } from '@tui/core';

export const preferences: AppPreferenceConfigs = {
  topnav: {
    slots: {
      right: [<AppDrawerAccessibilityIconButton key="a11y" />]
    }
  }
};
```

The button also registers keyboard shortcuts: `Ctrl+U` opens the panel, `Escape` closes it. The drawer it opens is
registered under the id `tui.app.drawer.accessibility`.

See [useMyAccessibility](../template/app/hooks/useMyAccessibility.tsx) for the full pattern.

## Choosing which controls users get

Every control can be turned off individually through the provider's `preferences` prop. This is useful when a setting
conflicts with your application — for example, if your own layout already manages line height.

```tsx
<AppAccessibilityProvider preferences={{ enableCursor: false, enableTextSpacing: false }}>
```

| Flag                      | Turns off                                   |
| ------------------------- | ------------------------------------------- |
| `enableAccessibility`     | The whole module, including the button      |
| `enableCursor`            | The enlarged reading cursor                 |
| `enableAnimation`         | The reduce-animation control                |
| `enableLineHeight`        | Line-height adjustment                      |
| `enableTextSize`          | Text-size adjustment                        |
| `enableTextAlignment`     | Text-alignment adjustment                   |
| `enableTextSpacing`       | Letter and word spacing adjustment          |
| `enableTooltipLeaveDelay` | The control for how long tooltips stay open |

Defaults live in [AppAccessibilityDefaults.ts](src/configs/AppAccessibilityDefaults.ts); the type is
[AppAccessibilityPreferences](src/configs/AppAccessibilityPreferences.ts).

To add your own control to the panel, pass it through the `features` prop as a `ReactNode`. It renders alongside the
built-in ones.

## How it works

The provider does not restyle components one by one. It builds a set of MUI theme overrides from the user's current
settings — see [useAccessibilityThemeBuilder](src/hooks/useAccessibilityThemeBuilder.ts) — and layers them over your
theme, so anything reading the theme picks the changes up for free. The reading cursor is a separate overlay rendered
by [AppAccessibilityReadingCursors](src/components/AppAccessibilityReadingCursors.tsx).

## Troubleshooting

| Symptom                                     | Likely cause                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| The button does nothing                     | `@tui/drawer` is missing, or `AppDrawerProvider` is not mounted above it   |
| The panel shows raw keys                    | `addTranslations` was never called, or ran after the first render          |
| Settings change but nothing looks different | `AppAccessibilityProvider` is not mounted, or `enableAccessibility` is off |
| One control is missing                      | Its `enable*` flag is `false` in the provider's `preferences`              |

## Related

- **[Accessibility hooks reference](../../docs/reference/hooks/a11y.md)** — every hook this module exports.
- **[Configuration](../../docs/configuration.md)** — where module providers belong in the shell.
- **[`@tui/drawer`](../drawer/README.md)** — the drawer this module renders into.
- **[useMyAccessibility](../template/app/hooks/useMyAccessibility.tsx)** — a working example in the template app.
