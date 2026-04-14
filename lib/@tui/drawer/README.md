# `@tui/drawer`

Right-side **Application Drawer** for TemplateUI v4.

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Concepts](#concepts)
- [Integration](#integration)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## Overview

This module provides:

- A drawer **provider** + **hook** to open/close a right-hand drawer from anywhere in your app
- A layout **container** that reserves horizontal space when the drawer is **pinned**
- A responsive drawer element (mobile full-width, optional maximize on larger screens)

Use this module when you need a slide-in panel for details, forms, settings, or any secondary content.

Exports live in [`@tui/drawer`](src/index.ts). The module namespace constant is [`MODULE_NAME`](src/name.ts) (`tui.drawer`).

---

## Installation

### 1) Configure npm registry

Create or update `~/.npmrc`:

```ini
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

### 2) Install the package

```bash
pnpm add @tui/drawer
```

---

## Quick Start

### 1) Add the provider (required)

Mount [`AppDrawerProvider`](src/providers/AppDrawerProvider.tsx) above any component that calls [`useAppDrawer`](src/hooks/useAppDrawer.tsx):

```tsx
import type { PropsWithChildren } from 'react';
import { AppDrawerProvider } from '@tui/drawer';

export function MyAppProvider({ children }: PropsWithChildren) {
  return <AppDrawerProvider>{children}</AppDrawerProvider>;
}
```

The recommended placement for optional modules is between `AppRoot` and `AppProvider` (see [docs/guides/configuration-guide.md](../../docs/guides/configuration-guide.md)).

---

### 2) Add the container (recommended)

To ensure **pinned** drawers reserve space (push content left instead of overlaying), wrap your layout with [`AppDrawerContainer`](src/elements/AppDrawerContainer.tsx):

```tsx
import type { PropsWithChildren } from 'react';
import { AppDrawerContainer } from '@tui/drawer';

export function Layout({ children }: PropsWithChildren) {
  return <AppDrawerContainer>{children}</AppDrawerContainer>;
}
```

If you do not render [`AppDrawerContainer`](src/elements/AppDrawerContainer.tsx), the drawer UI can still render, but your content may sit "under" it when pinned.

In TemplateUI, the container is typically injected via the `slots.layout` preference:

```tsx
import { AppDrawerContainer } from '@tui/drawer';
import type { AppPreferenceConfigs } from '@tui/core';

export const preferences: AppPreferenceConfigs = {
  // ...existing preferences...
  slots: {
    layout: AppDrawerContainer
  }
};
```

---

### 3) Open and close the drawer

Use [`useAppDrawer`](src/hooks/useAppDrawer.tsx) and call `open()` with [`AppDrawerOpenProps`](src/providers/AppDrawerProvider.tsx):

```tsx
import { Button } from '@mui/material';
import { PageContent } from '@tui/core';
import { useAppDrawer } from '@tui/drawer';

export function OpenDrawerButton() {
  const drawer = useAppDrawer();

  return (
    <Button
      onClick={() =>
        drawer.open({
          id: 'app.drawer.example',
          mode: 'pin',
          onClose: () => console.log('drawer closed'),
          element: <PageContent>This is the app drawer.</PageContent>
        })
      }
    >
      Open drawer
    </Button>
  );
}
```

Close it:

```tsx
import { useAppDrawer } from '@tui/drawer';

export function CloseDrawerButton() {
  const drawer = useAppDrawer();
  return <button onClick={drawer.close}>Close</button>;
}
```

A working example exists in the template route: [`toggleDrawer`](../template/app/routes/examples.layout/route.tsx) in [packages/template/app/routes/examples.layout/route.tsx](../template/app/routes/examples.layout/route.tsx).

---

## API Reference

### `AppDrawerProvider`

The context provider that manages drawer state.

**Props:**

| Prop       | Type        | Description       |
| ---------- | ----------- | ----------------- |
| `children` | `ReactNode` | Child components. |

**Provides:**

The provider exposes state and methods via [`AppDrawerContextType`](src/providers/AppDrawerProvider.tsx):

| Field              | Type            | Description                                    |
| ------------------ | --------------- | ---------------------------------------------- |
| `id`               | `string`        | Unique identifier of the current drawer.       |
| `isOpen`           | `boolean`       | Whether the drawer is open.                    |
| `isFloatThreshold` | `boolean`       | Whether viewport is below the float threshold. |
| `expandable`       | `boolean`       | Whether the drawer can be maximized.           |
| `width`            | `number`        | Current drawer width.                          |
| `maximized`        | `boolean`       | Whether the drawer is maximized.               |
| `mode`             | `AppDrawerMode` | Current mode (`'pin'` or `'float'`).           |
| `enableClickAway`  | `boolean`       | Whether clicking outside closes the drawer.    |

Source: [`AppDrawerProvider`](src/providers/AppDrawerProvider.tsx)

---

### `useAppDrawer`

Hook to access drawer state and actions.

**Returns:** [`AppDrawerContextType`](src/providers/AppDrawerProvider.tsx)

**Methods:**

| Method         | Signature                             | Description                                   |
| -------------- | ------------------------------------- | --------------------------------------------- |
| `open`         | `(props: AppDrawerOpenProps) => void` | Open the drawer with the given configuration. |
| `close`        | `() => void`                          | Close the drawer.                             |
| `setWidth`     | `(width: number \| string) => void`   | Update the drawer width.                      |
| `setMode`      | `(mode: AppDrawerMode) => void`       | Switch between `'pin'` and `'float'`.         |
| `setMaximized` | `(maximized: boolean) => void`        | Toggle maximized state.                       |
| `setElement`   | `(element: ReactElement) => void`     | Update the drawer content.                    |

**Example:**

```tsx
import { useAppDrawer } from '@tui/drawer';

export function DrawerControls() {
  const drawer = useAppDrawer();

  return (
    <div>
      <p>Drawer is {drawer.isOpen ? 'open' : 'closed'}</p>
      <button onClick={() => drawer.setMode('float')}>Switch to float</button>
      <button onClick={() => drawer.setMaximized(true)}>Maximize</button>
    </div>
  );
}
```

Source: [`useAppDrawer`](src/hooks/useAppDrawer.tsx)

---

### `AppDrawerContainer`

Layout wrapper that reserves space for pinned drawers and renders the drawer UI.

**Props:**

| Prop       | Type        | Description               |
| ---------- | ----------- | ------------------------- |
| `children` | `ReactNode` | Your page/layout content. |

**Behavior:**

- Renders [`AppDrawer`](src/elements/AppDrawer.tsx) internally
- Reserves horizontal space when drawer is pinned and not in float threshold
- Shows a backdrop when drawer is floating or maximized

Source: [`AppDrawerContainer`](src/elements/AppDrawerContainer.tsx)

---

### `AppDrawerOpenProps`

Configuration object passed to `drawer.open()`.

| Field             | Type               | Required | Description                                                         |
| ----------------- | ------------------ | -------- | ------------------------------------------------------------------- |
| `id`              | `string`           | Yes      | Unique identifier for this drawer instance.                         |
| `element`         | `ReactElement`     | Yes      | Content to render inside the drawer.                                |
| `mode`            | `'pin' \| 'float'` | No       | How the drawer behaves. Default: `'float'`.                         |
| `width`           | `number`           | No       | Custom Drawer width.                                                |
| `expandable`      | `boolean`          | No       | Allow maximize button. Default: `true`.                             |
| `floatThreshold`  | `number`           | No       | Viewport width below which drawer floats. Default: `1200`.          |
| `enableClickAway` | `boolean`          | No       | Close on outside click. Default: `true` for float, `false` for pin. |
| `onClose`         | `() => void`       | No       | Callback when drawer closes.                                        |

Source: [`AppDrawerOpenProps`](src/providers/AppDrawerProvider.tsx)

---

### `AppDrawerMode`

```ts
type AppDrawerMode = 'pin' | 'float';
```

- `pin` — Drawer reserves horizontal space; content shifts left
- `float` — Drawer overlays content with a backdrop

---

## Concepts

### Modes: Pin vs Float

| Mode    | Behavior                            | Best for                             |
| ------- | ----------------------------------- | ------------------------------------ |
| `pin`   | Reserves space, content shifts left | Persistent panels (filters, details) |
| `float` | Overlays content with backdrop      | Temporary panels (quick actions)     |

**Example — Floating drawer:**

```tsx
drawer.open({
  id: 'help',
  mode: 'float',
  enableClickAway: true,
  element: <PageContent>Help content</PageContent>
});
```

**Example — Pinned drawer:**

```tsx
drawer.open({
  id: 'details',
  mode: 'pin',
  element: <PageContent>Detail panel</PageContent>
});
```

---

### Responsive Behavior (Float Threshold)

The provider computes `isFloatThreshold` based on the `floatThreshold` value (default: `1200px`).

When the viewport is narrower than the threshold:

- Pinned drawers behave like floating drawers
- [`AppDrawerContainer`](src/elements/AppDrawerContainer.tsx) doesn't reserve space

**Override per-open:**

```tsx
drawer.open({
  id: 'filters',
  mode: 'pin',
  floatThreshold: 900, // Float on screens < 900px
  element: <PageContent>Filters</PageContent>
});
```

---

### Width and Maximize

[`AppDrawer`](src/elements/AppDrawer.tsx) calculates width based on:

| Condition              | Width                              |
| ---------------------- | ---------------------------------- |
| XS/SM breakpoints      | Full viewport width                |
| Maximized              | $0.9 \times \text{viewport width}$ |
| User-specified `width` | That value                         |
| MD breakpoint          | 550px                              |
| LG breakpoint          | 650px                              |
| XL breakpoint          | 800px                              |

When `expandable: true` (default), users can toggle maximize via a button in the drawer header.

---

## Integration

### Recommended placement in TemplateUI v4

```tsx
import type { PropsWithChildren } from 'react';
import { AppDrawerProvider, AppDrawerContainer } from '@tui/drawer';

export function MyAppProvider({ children }: PropsWithChildren) {
  return (
    <AppDrawerProvider>
      <AppDrawerContainer>{children}</AppDrawerContainer>
    </AppDrawerProvider>
  );
}
```

Or, using the slot pattern:

```tsx
// In your preferences hook
import { AppDrawerContainer } from '@tui/drawer';
import type { AppPreferenceConfigs } from '@tui/core';

export const preferences: AppPreferenceConfigs = {
  slots: {
    layout: AppDrawerContainer
  }
};
```

The template app demonstrates this in:

- Provider: [packages/template/app/root.tsx](../template/app/root.tsx)
- Slot config: [packages/template/app/hooks/useMyPreferences.tsx](../template/app/hooks/useMyPreferences.tsx)

---

### Using with other `@tui` modules

Several modules depend on `@tui/drawer`:

| Module      | Dependency                                   |
| ----------- | -------------------------------------------- |
| `@tui/a11y` | Uses drawer for accessibility settings panel |

When using these modules, ensure [`AppDrawerProvider`](src/providers/AppDrawerProvider.tsx) is mounted first:

```tsx
import { AppDrawerProvider } from '@tui/drawer';
import { AppAccessibilityProvider } from '@tui/a11y';

<AppDrawerProvider>
  <AppAccessibilityProvider>{children}</AppAccessibilityProvider>
</AppDrawerProvider>;
```

---

## Troubleshooting

### Nothing happens when calling `useAppDrawer`

**Cause:** [`AppDrawerProvider`](src/providers/AppDrawerProvider.tsx) is not mounted above the component.

**Solution:** Ensure the provider wraps your app or layout:

```tsx
<AppDrawerProvider>
  <MyComponent /> {/* Can now use useAppDrawer */}
</AppDrawerProvider>
```

---

### Pinned drawer overlaps content

**Cause:** [`AppDrawerContainer`](src/elements/AppDrawerContainer.tsx) is not wrapping your layout.

**Solution:** Wrap your content with the container:

```tsx
<AppDrawerContainer>
  <YourPageContent />
</AppDrawerContainer>
```

---

### Pinned drawer doesn't reserve space

**Cause:** Missing `width` in `open()` call.

**Solution:** Always provide `width` when using `mode: 'pin'`:

```tsx
drawer.open({
  id: 'panel',
  mode: 'pin',
  width: 500, // Required!
  element: <Content />
});
```

---

### Clicking outside doesn't close the drawer

**Cause:** `enableClickAway` is not set (defaults to `false` for pinned drawers).

**Solution:** Explicitly enable click-away:

```tsx
drawer.open({
  id: 'panel',
  mode: 'pin',
  width: 500,
  enableClickAway: true, // Enable click-away
  element: <Content />
});
```

---

### Drawer appears behind other elements

**Cause:** Z-index conflicts with other components.

**Solution:** The drawer uses `theme.zIndex.drawer + 2`. If you have custom overlays, ensure they use a lower z-index, or adjust your theme's z-index scale.

---

### Maximize button doesn't appear

**Cause:** `expandable` is set to `false`, or viewport is SM or smaller.

**Solution:**

- Ensure `expandable: true` (or omit it—defaults to `true`)
- The maximize button is hidden on small screens by design

---

## Related Documentation

- [Configuration Guide](../../docs/guides/configuration-guide.md) — How to configure your TemplateUI app
- [@tui/core](../core/README.md) — Core module documentation
- [@tui/a11y](../a11y/README.md) — Accessibility module (uses drawer)
- [@tui/apps](../apps/README.md) — App switcher module
- [@tui/classi](../classi/README.md) — Classification module
- [@tui/notis](../notis/README.md) — Notifications module
