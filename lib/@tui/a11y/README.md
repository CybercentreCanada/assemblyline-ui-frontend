# `@tui/a11y`

Accessibility module for TemplateUI v4.

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Integration](#integration)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## Overview

This module provides:

- An accessibility provider that manages accessibility state and theme overrides
- A top-nav icon button that opens the accessibility drawer
- Built-in accessibility feature controls (cursor, animation, line height, text size, text spacing, text alignment, tooltip leave delay)

Use this module when you want standardized accessibility controls and keyboard-accessible configuration in your TemplateUI application.

Exports live in [`@tui/a11y`](src/index.ts). The module namespace constant is [`MODULE_NAME`](src/name.ts) (`tui.a11y`).

> Dependency note: The drawer UI uses [`useAppDrawer`](../drawer/src/hooks/useAppDrawer.tsx), so install `@tui/drawer` and mount [`AppDrawerProvider`](../drawer/src/providers/AppDrawerProvider.tsx).

---

## Installation

### 1) Configure npm registry

Create or update `~/.npmrc`:

```ini
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

### 2) Install the package(s)

```bash
pnpm add @tui/a11y @tui/drawer
```

---

## Quick Start

### 1) Register translations (required)

`@tui/a11y` ships `en`/`fr` resources. Register them on your i18n instance:

```ts
import i18n from './i18n';
import { addTranslations as addA11yTranslations } from '@tui/a11y';

addA11yTranslations(i18n);
```

Function: [`addTranslations`](src/i18n/index.ts)

Template example: [`addA11yTranslations(i18n)`](../template/app/i18n.ts)

---

### 2) Mount providers (required)

Mount drawer provider first, then accessibility provider:

```tsx
import type { PropsWithChildren } from 'react';
import { AppAccessibilityProvider } from '@tui/a11y';
import { AppDrawerProvider } from '@tui/drawer';

export function MyAppProvider({ children }: PropsWithChildren) {
  return (
    <AppDrawerProvider>
      <AppAccessibilityProvider>{children}</AppAccessibilityProvider>
    </AppDrawerProvider>
  );
}
```

Provider: [`AppAccessibilityProvider`](src/providers/AppAccessibilityProvider.tsx)

---

### 3) Render the accessibility icon button (recommended)

Render [`AppDrawerAccessibilityIconButton`](src/components/AppDrawerAccessibility.tsx) in a top-nav right-side slot:

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

Template example pattern: [`useMyAccessibility`](../template/app/hooks/useMyAccessibility.tsx)

---

## API Reference

### `AppAccessibilityProvider`

Source: [`AppAccessibilityProvider`](src/providers/AppAccessibilityProvider.tsx)

**Props:**

| Prop          | Type                          | Description                                              |
| ------------- | ----------------------------- | -------------------------------------------------------- |
| `preferences` | `AppAccessibilityPreferences` | Enable/disable accessibility capabilities.               |
| `features`    | `ReactNode[]`                 | Additional custom feature nodes to render in the drawer. |
| `children`    | `ReactNode`                   | Child components.                                        |

Defaults:

- [`AppDefaultsAccessibilityPreferences`](src/configs/AppAccessibilityDefaults.ts)
- [`AppDefaultsAccessibilityStates`](src/configs/AppAccessibilityDefaults.ts)

---

### `AppAccessibilityPreferences`

Source: [`AppAccessibilityPreferences`](src/configs/AppAccessibilityPreferences.ts)

Feature flags:

- `enableAccessibility`
- `enableCursor`
- `enableAnimation`
- `enableLineHeight`
- `enableTextSize`
- `enableTextAlignment`
- `enableTextSpacing`
- `enableTooltipLeaveDelay`

---

### `AppDrawerAccessibilityIconButton`

Source: [`AppDrawerAccessibilityIconButton`](src/components/AppDrawerAccessibility.tsx)

Behavior highlights:

- Opens a drawer with accessibility controls (`id: tui.app.drawer.accessibility`)
- Registers keyboard shortcuts (`Ctrl+U` to open, `Escape` to close)
- Respects `enableAccessibility` from preferences

---

### i18n API

- Namespace: [`MODULE_NAME`](src/name.ts)
- Translation registration: [`addTranslations`](src/i18n/index.ts)

---

### Hooks

Exported from [`src/hooks/index.ts`](src/hooks/index.ts):

- [`useAppAccessibilityContext`](src/hooks/useAppAccessibilityContext.tsx)
- [`useAppAccessibilityPreferences`](src/hooks/useAppAccessibilityPreferences.tsx)
- [`useAppAccessibilityStates`](src/hooks/useAppAccessibilityStates.tsx)
- [`useAppAccessibilityFeatures`](src/hooks/useAppAccessibilityFeatures.tsx)
- [`useAppKeyboardShortcut`](src/hooks/useAppKeyboardShortcut.tsx)
- [`useAccessibilityThemeBuilder`](src/hooks/useAccessibilityThemeBuilder.ts)

---

## Integration

### Recommended placement in TemplateUI v4

If your app follows the provider layering in [`docs/guides/configuration-guide.md`](../../docs/guides/configuration-guide.md), mount optional module providers between app root and app provider, then place feature actions (like accessibility button) in TopNav slots.

### Theme and visual behavior

`@tui/a11y` applies runtime MUI theme overrides through [`useAccessibilityThemeBuilder`](src/hooks/useAccessibilityThemeBuilder.ts) and renders reading cursor overlays via [`AppAccessibilityReadingCursors`](src/components/AppAccessibilityReadingCursors.tsx).

---

## Troubleshooting

### Accessibility button does not open drawer

- Ensure `@tui/drawer` is installed.
- Ensure [`AppDrawerProvider`](../drawer/src/providers/AppDrawerProvider.tsx) is mounted above [`AppDrawerAccessibilityIconButton`](src/components/AppDrawerAccessibility.tsx).

### Missing translation keys

- Ensure [`addTranslations`](src/i18n/index.ts) is called before rendering.

### Accessibility settings do not visually apply

- Ensure [`AppAccessibilityProvider`](src/providers/AppAccessibilityProvider.tsx) is mounted.
- Verify `enableAccessibility` is not disabled in [`AppAccessibilityPreferences`](src/configs/AppAccessibilityPreferences.ts).

---

## Related Documentation

- [Template app accessibility hook](../template/app/hooks/useMyAccessibility.tsx)
- [Template app i18n bootstrap](../template/app/i18n.ts)
- [Configuration guide](../../docs/guides/configuration-guide.md)
- [@tui/drawer README](../drawer/README.md)
