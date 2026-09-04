# `@tui/core`

The required module of TemplateUI v4.

`@tui/core` is the shell your application lives inside. It provides the top navigation, the left navigation, the
breadcrumb trail, the page chrome, the theming system, and the cookie-backed user preferences — the common look and
feel that every TemplateUI application shares. Every other `@tui` package is optional and plugs into this one.

If you are building an application, you do not usually install this by hand: `tcli create` scaffolds a project that
already depends on it. See [Getting started](../../docs/getting-started.md).

## Install

Point npm at the BoH registry:

```ini
# ~/.npmrc
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

Then install:

```bash
pnpm add @tui/core
```

## The two components you wire up

Almost all of the configuration surface is reached through two components.

**`AppRoot`** wraps everything. It is the environment layer: you hand it your i18n instance, the cookies parsed from
the incoming request, and your router adapter. Because it receives cookies from the server, the first paint already has
the right theme and language — no flash of the wrong appearance.

**`AppProvider`** sits inside it and describes the application itself: its name and branding, the navigation menus, the
available themes, and which preferences users are allowed to change.

```tsx
<AppRoot i18n={i18n} cookies={cookies} router={router}>
  <AppProvider app={app} preferences={preferences}>
    {children}
  </AppProvider>
</AppRoot>
```

[Configuration](../../docs/configuration.md) explains this layering properly, including where optional module providers
belong.

## Reading and driving the shell

Anything the shell knows, your components can read through hooks — the current theme and density, the signed-in user,
the breadcrumb trail, the state of the navigation, the quick-search service. For example:

```tsx
import { useAppTheme, useAppUser } from '@tui/core';

const { mode, toggleMode } = useAppTheme();
const { user } = useAppUser();
```

Every hook must be called beneath `AppRoot` and `AppProvider`. The full list, with signatures, is in the
[hooks reference](../../docs/reference/hooks.md).

## It does not depend on a router

`@tui/core` never imports React Router, or any other router. Navigation is expressed through the `AppRouterAdapter`
interface, and your application supplies an implementation — the template ships a React Router v7 one.

This keeps the shell usable in applications that route differently, and it is a hard rule when contributing: nothing
under `packages/core/src` may import a concrete router.

## Preferences are stored in cookies

Theme, mode, language, density, and the rest are persisted as cookies rather than in `localStorage`. That is what lets
the server render the correct appearance on the very first response. Follow the same pattern for any preference you
add — [Preferences](../../docs/preferences.md) covers the model and the nine built-in settings.

## Related

- **[Configuration](../../docs/configuration.md)** — the three-layer model and how to wire the shell.
- **[Configuration reference](../../docs/reference/configuration.md)** — every option, type, and default.
- **[Hooks reference](../../docs/reference/hooks.md)** — every hook this package exports.
- **[Preferences](../../docs/preferences.md)** — the cookie-backed preference and theming model.
- **[Getting started](../../docs/getting-started.md)** — scaffold an application that uses this package.
