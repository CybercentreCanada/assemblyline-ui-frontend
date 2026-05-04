# layout/auth

Authentication layout that renders different screens based on the current auth state. Handles the full authentication lifecycle UI — from login forms to session expiry notices.

## Responsibilities

- Auth state detection and screen routing (loading, login, locked, logout, quota, terms of service)
- Login screen with support for multiple auth methods (OAuth, SAML, userpass)
- Logout confirmation and session cleanup UI
- Account locked and quota exceeded screens
- Terms of service acceptance flow
- Auth status query on mount

## Key Files

- `AppAuthLayout.tsx` — Main auth layout that switches screens based on auth state
- `loading/` — Loading/splash screen during auth resolution
- `locked/` — Account locked screen
- `log-in/` — Login form components
- `log-out/` — Logout confirmation screen
- `quota/` — Quota exceeded screen
- `terms-of-service/` — Terms acceptance screen


# core/auth

Handles all authentication flows and user identity management. Supports multiple login methods (OAuth, SAML, userpass) and manages session lifecycle.

## Responsibilities

- Login/logout flows for OAuth, SAML, and username/password authentication
- Token management and session persistence
- User identity resolution (WhoAmI data)
- Authentication state tracking (logged in, expired, locked)
- Login parameter types and configuration

## Key Files

- `auth.config.ts` — Auth provider settings, login method configuration
- `auth.hooks.tsx` — Hooks for login, logout, and session status
- `auth.models.tsx` — User identity types, login parameter types
- `auth.utils.tsx` — Token parsing, session validation utilities
