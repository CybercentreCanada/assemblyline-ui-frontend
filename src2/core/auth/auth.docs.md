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
