# `@tui/drawer`

Right-side app drawer for TemplateUI v4.

This module gives you one drawer, shared by the whole application, that any component can open from anywhere. Use it
for detail panels, filters, forms, settings — any secondary content that should not take you off the page.

It is also the surface other modules build on: `@tui/a11y` renders its accessibility panel here, which is why it asks
you to install this package too.

The module namespace is `tui.drawer` — see [MODULE_NAME](src/name.ts). Everything public is exported from
[src/index.ts](src/index.ts).

## Install

Point npm at the BoH registry:

```ini
# ~/.npmrc
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

Then install:

```bash
pnpm add @tui/drawer
```

## Setting it up

### Mount the provider

[AppDrawerProvider](src/providers/AppDrawerProvider.tsx) holds the drawer state. It goes with your other module
providers, between `AppRoot` and `AppProvider` — see
[Optional modules](../../docs/configuration.md#optional-modules):

```tsx
import { AppDrawerProvider } from '@tui/drawer';
import type { PropsWithChildren } from 'react';

export const MyAppProvider = ({ children }: PropsWithChildren) => <AppDrawerProvider>{children}</AppDrawerProvider>;
```

### Add the container

[AppDrawerContainer](src/elements/AppDrawerContainer.tsx) renders the drawer itself and reserves horizontal space for
it when it is pinned. Without it the drawer still appears, but your page content sits underneath instead of shifting
aside.

The tidiest way to add it is through the layout slot, so you do not have to touch your own layout components:

```tsx
import type { AppPreferenceConfigs } from '@tui/core';
import { AppDrawerContainer } from '@tui/drawer';

export const preferences: AppPreferenceConfigs = {
  slots: {
    layout: AppDrawerContainer
  }
};
```

The template app wires it this way in
[useMyPreferences](../template/app/hooks/useMyPreferences.tsx).

### Open it

Call `open()` with an id and the content to render:

```tsx
import { Button } from '@mui/material';
import { PageContent } from '@tui/core';
import { useAppDrawer } from '@tui/drawer';

export const OpenDrawerButton = () => {
  const drawer = useAppDrawer();

  return (
    <Button
      onClick={() =>
        drawer.open({
          id: 'app.drawer.example',
          mode: 'pin',
          element: <PageContent>This is the app drawer.</PageContent>
        })
      }
    >
      Open drawer
    </Button>
  );
};
```

`drawer.close()` closes it again. A working example lives in the template's
[layout example route](../template/app/routes/_app.examples_.layout/route.tsx).

## Pinned or floating

The `mode` you pass to `open()` is the main decision, and it comes down to whether the panel is something the user
works alongside or something they dismiss.

| Mode              | What it does                             | Use it for                            |
| ----------------- | ---------------------------------------- | ------------------------------------- |
| `pin`             | Reserves space; page content shifts left | Filters, detail panels kept open      |
| `float` (default) | Overlays the page with a backdrop        | Quick actions, help, temporary panels |

Click-away follows from that choice: floating drawers close when you click outside, pinned ones do not. Pass
`enableClickAway` explicitly if you want the other behaviour.

### Narrow screens override the choice

There is not enough room to pin a drawer on a small viewport, so below `floatThreshold` (1200px by default) a pinned
drawer floats instead and the container stops reserving space. You can move that line per drawer:

```tsx
drawer.open({ id: 'filters', mode: 'pin', floatThreshold: 900, element: <Filters /> });
```

### Width

You can pass an explicit `width`, but you usually do not need to — the drawer sizes itself by breakpoint: full width on
XS and SM, 550px at MD, 650px at LG, 800px at XL. A maximized drawer takes 90% of the viewport.

Unless you pass `expandable: false`, users get a maximize button in the drawer header. It is hidden on small screens,
where the drawer is already full width.

For the full `useAppDrawer` surface — `setWidth`, `setMode`, `setMaximized`, `setElement` and the state it exposes —
see the [drawer hooks reference](../../docs/reference/hooks/drawer.md).

## Using it with `@tui/a11y`

`@tui/a11y` renders into this drawer, so its provider must sit inside `AppDrawerProvider`:

```tsx
<AppDrawerProvider>
  <AppAccessibilityProvider>{children}</AppAccessibilityProvider>
</AppDrawerProvider>
```

## Troubleshooting

| Symptom                                | Likely cause                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `useAppDrawer` does nothing            | `AppDrawerProvider` is not mounted above the component calling it                           |
| The drawer covers your content         | `AppDrawerContainer` is not in the tree — add it, or set it as the `layout` slot            |
| A pinned drawer does not reserve space | The viewport is below `floatThreshold`, so it is floating by design                         |
| Clicking outside does not close it     | The drawer is pinned; pass `enableClickAway: true` to opt in                                |
| The drawer sits behind something       | The drawer uses `theme.zIndex.drawer + 2`; give custom overlays a lower z-index             |
| No maximize button                     | `expandable` is `false`, or the viewport is SM or smaller, where it is hidden intentionally |

## Related

- **[Drawer hooks reference](../../docs/reference/hooks/drawer.md)** — the full `useAppDrawer` surface.
- **[Configuration](../../docs/configuration.md)** — where module providers and layout slots belong.
- **[`@tui/a11y`](../a11y/README.md)** — the accessibility module that renders into this drawer.
- **[`@tui/core`](../core/README.md)** — the shell this module plugs into.
