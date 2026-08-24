# `@tui/classi`

Standardized **classification UI** for TemplateUI v4.

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [TLP (Traffic Light Protocol)](#tlp-traffic-light-protocol)
- [Integration](#integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

This module provides:

- A **classification provider** with optional remote fetch support
- A **classification chip component** for standard Canadian government classifications
- A **TLP chip component** (Traffic Light Protocol)

### Supported Classifications

| Value | Description  |
| ----- | ------------ |
| `u`   | Unclassified |
| `pa`  | Protected A  |
| `pb`  | Protected B  |
| `pc`  | Protected C  |
| `c`   | Confidential |
| `s`   | Secret       |
| `ts`  | Top Secret   |

Exports live in [`@tui/classi`](src/index.ts). The module i18n namespace is [`MODULE_NAME`](src/name.ts) (`tui.classi`).

---

## Installation

### 1) Configure npm registry

Create or update `~/.npmrc`:

```ini
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

### 2) Install the package

```bash
pnpm add @tui/classi
```

---

## Quick Start

### 1) Register translations (required)

`@tui/classi` ships with built-in `en`/`fr` strings. Register them on your i18n instance **before** rendering any classification components:

```ts
import i18n from './i18n'; // your i18next instance
import { addTranslations as addClassiTranslations } from '@tui/classi';

addClassiTranslations(i18n);
```

Function: [`addTranslations`](src/i18n/index.ts)

---

### 2) Add the provider (required)

Wrap your app with [`AppClassificationProvider`](src/providers/AppClassificationProvider.tsx).

#### Option A — Static classification (build/deploy time)

Use this when the classification is known ahead of time:

```tsx
import type { PropsWithChildren } from 'react';
import { AppClassificationProvider } from '@tui/classi';

export function MyAppProvider({ children }: PropsWithChildren) {
  return <AppClassificationProvider value="pb">{children}</AppClassificationProvider>;
}
```

#### Option B — Dynamic classification (fetched at runtime)

Use this when classification comes from an API endpoint:

```tsx
import type { PropsWithChildren } from 'react';
import { AppClassificationProvider } from '@tui/classi';

export function MyAppProvider({ children }: PropsWithChildren) {
  return <AppClassificationProvider url="/api/classification">{children}</AppClassificationProvider>;
}
```

The endpoint should return JSON matching [`AppClassificationResponse`](src/providers/AppClassificationProvider.tsx):

```json
{
  "value": "pb"
}
```

> **Note**: If both `value` and `url` are provided, `value` takes precedence.

---

### 3) Render the classification chip

```tsx
import { AppClassification } from '@tui/classi';

export function Header() {
  return <AppClassification />;
}
```

The chip automatically:

- Reads the current classification from context
- Displays abbreviated text on small screens, full text on larger screens
- Shows a security icon on larger screens

---

## API Reference

### `AppClassificationProvider`

The context provider that holds classification state.

**Props:**

| Prop       | Type                     | Description                                                |
| ---------- | ------------------------ | ---------------------------------------------------------- |
| `value`    | `AppClassificationValue` | Static classification value. Takes precedence over `url`.  |
| `url`      | `string`                 | Endpoint that returns `{ value: AppClassificationValue }`. |
| `children` | `ReactNode`              | Child components.                                          |

**Example:**

```tsx
<AppClassificationProvider value="s">
  <App />
</AppClassificationProvider>
```

---

### `AppClassification`

The classification chip component.

**Props:**

| Prop        | Type                     | Description                                                          |
| ----------- | ------------------------ | -------------------------------------------------------------------- |
| `overwrite` | `AppClassificationState` | Override the displayed classification without changing global state. |
| `variant`   | `string`                 | Visual variant (see source for options).                             |
| `mx`        | `MxProps`                | MUI margin props (`m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my`).          |

**Example — Basic usage:**

```tsx
import { AppClassification } from '@tui/classi';

export function Header() {
  return <AppClassification />;
}
```

**Example — Override for a specific context:**

```tsx
import { AppClassification } from '@tui/classi';

export function SecretSection() {
  // Show "Secret" chip regardless of global classification
  return <AppClassification overwrite="s" />;
}
```

---

### `useAppClassification`

Hook to read and update classification state programmatically.

**Returns:**

| Field      | Type                                               | Description                   |
| ---------- | -------------------------------------------------- | ----------------------------- |
| `value`    | `AppClassificationState`                           | Current classification value. |
| `setValue` | `Dispatch<SetStateAction<AppClassificationState>>` | Update the classification.    |

**Example:**

```tsx
import { useAppClassification } from '@tui/classi';

export function ClassificationSelector() {
  const { value, setValue } = useAppClassification();

  return (
    <select value={value} onChange={e => setValue(e.target.value)}>
      <option value="u">Unclassified</option>
      <option value="pa">Protected A</option>
      <option value="pb">Protected B</option>
      <option value="s">Secret</option>
    </select>
  );
}
```

---

### Types

```ts
// Supported classification values
type AppClassificationValue = 'u' | 'pa' | 'pb' | 'pc' | 'c' | 's' | 'ts';

// Classification states (includes loading/error)
type AppClassificationState = AppClassificationValue | 'loading' | 'error';

// Expected response shape from classification endpoint
type AppClassificationResponse = { value: AppClassificationValue };

// Margin props for convenience
type MxProps = Pick<BoxProps, 'm' | 'mt' | 'mr' | 'mb' | 'ml' | 'mx' | 'my'>;
```

---

## TLP (Traffic Light Protocol)

The module also provides a TLP chip for information sharing designations.

### `AppTLP`

**Props:**

| Prop    | Type          | Description                                                                       |
| ------- | ------------- | --------------------------------------------------------------------------------- |
| `value` | `AppTLPValue` | TLP designation (e.g., `'TLP:RED'`, `'TLP:AMBER'`, `'TLP:GREEN'`, `'TLP:CLEAR'`). |
| `mx`    | `MxProps`     | MUI margin props.                                                                 |

**Example:**

```tsx
import { AppTLP } from '@tui/classi';

export function ShareIndicator() {
  return <AppTLP value="TLP:AMBER" />;
}
```

**Supported values:**

| Value       | Color  |
| ----------- | ------ |
| `TLP:RED`   | Red    |
| `TLP:AMBER` | Orange |
| `TLP:GREEN` | Green  |
| `TLP:CLEAR` | White  |

---

## Integration

### Recommended placement in TemplateUI v4

If your app follows the recommended layering in [docs/guides/configuration-guide.md](../../docs/guides/configuration-guide.md), mount the provider alongside other optional modules:

```tsx
import type { PropsWithChildren } from 'react';
import { AppDrawerProvider } from '@tui/drawer';
import { AppClassificationProvider } from '@tui/classi';

export function MyAppProvider({ children }: PropsWithChildren) {
  return (
    <AppDrawerProvider>
      <AppClassificationProvider value="pb">{children}</AppClassificationProvider>
    </AppDrawerProvider>
  );
}
```

### Displaying in the TopNav

A common pattern is rendering the classification chip in the app bar. Use the `topnav.slots` preference:

```tsx
import { AppClassification } from '@tui/classi';
import type { AppPreferenceConfigs } from '@tui/core';

export const preferences: AppPreferenceConfigs = {
  // ...existing preferences...
  topnav: {
    slots: {
      right: [<AppClassification key="classification" />]
    }
  }
};
```

---

## Troubleshooting

### Chip shows missing translation keys

**Cause**: Translations were not registered before rendering.

**Solution**: Ensure you call [`addTranslations`](src/i18n/index.ts) on your i18n instance during app initialization:

```ts
import { addTranslations } from '@tui/classi';
addTranslations(i18n);
```

---

### Provider URL does nothing

**Cause**: The `value` prop takes precedence over `url`.

**Solution**: Remove the `value` prop if you want to fetch classification from an endpoint:

```tsx
// ❌ Wrong — value takes precedence, url is ignored
<AppClassificationProvider value="u" url="/api/classification">

// ✅ Correct — url will be used
<AppClassificationProvider url="/api/classification">
```

---

### Endpoint returns data but chip shows "error"

**Cause**: The endpoint response doesn't match the expected shape.

**Solution**: Ensure your endpoint returns:

```json
{
  "value": "pb"
}
```

Where `value` is one of: `u`, `pa`, `pb`, `pc`, `c`, `s`, `ts`.

---

### Chip shows "loading" indefinitely

**Cause**: The fetch request is failing silently or CORS is blocking it.

**Solution**:

1. Check browser DevTools Network tab for failed requests
2. Verify the endpoint is accessible from the browser
3. Ensure CORS headers are configured on the server

---

## Related Documentation

- [Configuration Guide](../../docs/guides/configuration-guide.md) — How to configure your TemplateUI app
- [@tui/core](../core/README.md) — Core module documentation
- [@tui/drawer](../drawer/README.md) — Drawer module
- [@tui/a11y](../a11y/README.md) — Accessibility module
