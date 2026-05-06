# layout/top-nav

Top navigation bar action components. These are individual button/link components rendered in the application's top toolbar — providing access to documentation, support, user profile, and left-nav route items.

## Responsibilities

- About dialog trigger button
- Documentation link button (conditionally rendered from system config)
- Email support link button (conditionally rendered from system config)
- Left navigation route item (generic typed link component for nav drawers)
- User profile popover with theme, language, density settings, and logout

## Key Files

| File | Component | Purpose |
| ---- | --------- | ------- |
| `AboutButton.tsx` | `AboutButton` | Info icon button — opens the about/version dialog |
| `DocumentationButton.tsx` | `DocumentationButton` | Opens external documentation URL from `config.system.support.documentation` |
| `EmailButton.tsx` | `EmailButton` | Opens support email URL from `config.system.support.email` |
| `LeftNavRoute.tsx` | `LeftNavRoute` | Generic typed navigation item for left drawer — renders as `AppLink` with active state |
| `UserProfile.tsx` | `UserProfile` | User avatar button + popover with name, email, theme toggle, language selector, density switch, and logout |

## Conditional Rendering

- `DocumentationButton` — renders `null` if `configuration.system.support.documentation` is not set
- `EmailButton` — renders `null` if `configuration.system.support.email` is not set

## LeftNavRoute

A generic typed component for rendering navigation items in the left drawer:

```typescript
import { LeftNavRoute } from 'layout/top-nav';

<LeftNavRoute<typeof alertsRoute>
  icon={<AlertIcon />}
  primary="Alerts"
  to={{ path: '/alerts' }}
  navOpen={isDrawerOpen}
  navProps={childRenderProps}
/>
```

Supports nested levels via `navProps.level` — indentation increases for child routes.

## UserProfile

Renders the user avatar with a popover containing:

- User name and email display
- Dark/light theme toggle
- Language selector dropdown
- Compact density switch
- Logout button

Reads user data from `core/config` and preferences from `core/preference`.
