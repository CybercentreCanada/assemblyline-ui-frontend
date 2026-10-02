# `@tui/apps`

App switcher module for TemplateUI v4.

When your application is one of several related tools, users need a way to move between them. This module adds the
familiar grid button to the top navigation: click it and a menu drops down listing the other applications in your
suite, each with its own icon.

Use it when your app belongs to a suite. If it stands alone, skip this module.

The module namespace is `tui.apps` — see [MODULE_NAME](src/name.ts). Everything public is exported from
[src/index.ts](src/index.ts).

## Install

Point npm at the BoH registry:

```ini
# ~/.npmrc
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

Then install:

```bash
pnpm add @tui/apps
```

## Setting it up

Two steps: describe the apps and mount the provider, then drop the switcher into the top nav.

### Describe your apps

Each entry is an `AppSwitcherItem`. The two image fields are the reason the menu looks right in both themes — the
switcher picks `img_d` or `img_l` based on the current MUI mode, so supply both.

| Field       | Type                     | Required | What it is                                    |
| ----------- | ------------------------ | -------- | --------------------------------------------- |
| `alt`       | `string`                 | Yes      | Avatar alt text, usually a short abbreviation |
| `name`      | `string`                 | Yes      | The display name shown in the menu            |
| `img_d`     | `ReactElement \| string` | Yes      | Icon used in dark mode                        |
| `img_l`     | `ReactElement \| string` | Yes      | Icon used in light mode                       |
| `route`     | `string`                 | Yes      | A relative path or a full URL                 |
| `newWindow` | `boolean`                | No       | Open in a new tab instead of navigating       |

Keeping the list in its own hook makes it easy to swap a hardcoded array for an API call later:

```tsx
// hooks/useMyApps.tsx
import type { AppSwitcherItem } from '@tui/apps';

export const useMyApps = (): AppSwitcherItem[] => [
  {
    alt: 'AL',
    name: 'Assemblyline',
    img_d: '/branding/assemblyline/swoosh-dark.svg',
    img_l: '/branding/assemblyline/swoosh-light.svg',
    route: '/assemblyline'
  },
  {
    alt: 'Docs',
    name: 'Documentation',
    img_d: '/branding/docs/dark.svg',
    img_l: '/branding/docs/light.svg',
    route: 'https://example.com/docs',
    newWindow: true
  }
];
```

That is the pattern the template app uses — see [useMyApps](../template/app/hooks/useMyApps.tsx).

### Mount the provider

[AppSwitcherProvider](src/providers/AppSwitcherProvider.tsx) holds the list. It goes with your other module providers,
between `AppRoot` and `AppProvider` — see [Optional modules](../../docs/configuration.md#optional-modules):

```tsx
import { AppSwitcherProvider } from '@tui/apps';
import type { PropsWithChildren } from 'react';
import { useMyApps } from './hooks/useMyApps';

export const MyAppProvider = ({ children }: PropsWithChildren) => {
  const apps = useMyApps();

  return <AppSwitcherProvider apps={apps}>{children}</AppSwitcherProvider>;
};
```

### Render the switcher

[AppSwitcher](src/elements/AppSwitcher.tsx) takes no props — it reads everything from context. Add it to a top-nav
right-side slot, appending to whatever is already there:

```tsx
import { AppSwitcher } from '@tui/apps';
import type { AppPreferenceConfigs } from '@tui/core';

export const preferences: AppPreferenceConfigs = {
  topnav: {
    slots: {
      right: [<AppSwitcher key="app-switcher" />]
    }
  }
};
```

## Changing the list at runtime

The app list does not have to be static. `useAppSwitcher` gives you the current items and a setter, so you can load the
list from an API or show entries conditionally based on the signed-in user's permissions:

```tsx
const { items, setItems, empty } = useAppSwitcher();
```

Guard against duplicates when appending, since effects can run more than once:

```tsx
setItems(prev => (prev.some(app => app.route === newApp.route) ? prev : [...prev, newApp]));
```

See the [app switcher hooks reference](../../docs/reference/hooks/apps.md) for the full signature.

## Things worth knowing

**An empty list renders nothing.** `AppSwitcher` hides itself entirely when there are no apps, rather than showing an
empty menu. This is deliberate, and it is the most common reason the button seems to be missing.

**The menu closes on click-away, not on selection.** For internal navigation the menu stays open through the route
change, which keeps it usable when someone misclicks.

## Troubleshooting

| Symptom                      | Likely cause                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| No button in the top nav     | The list is empty, the provider is not mounted, or `AppSwitcher` was never added to a slot  |
| Icons are blank              | `img_d` / `img_l` point at files that are not in `public/`, or the paths are wrong          |
| Clicking an app does nothing | An internal `route` has no matching route; an external one is missing its `https://` prefix |

## Related

- **[App switcher hooks reference](../../docs/reference/hooks/apps.md)** — the `useAppSwitcher` signature.
- **[Configuration](../../docs/configuration.md)** — where module providers belong in the shell.
- **[useMyApps](../template/app/hooks/useMyApps.tsx)** — a working example in the template app.
- **[`@tui/core`](../core/README.md)** — the shell this module plugs into.
