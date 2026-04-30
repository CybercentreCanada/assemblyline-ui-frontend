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
