# layout/auth

Authentication layout that renders the whole app behind an auth state machine. `AppAuthLayout` swaps the entire tree for a dedicated screen whenever the user is not in a usable session, and renders `children` only once the session is valid.

## Responsibilities

- Resolve the session through the `whoami` query and derive the current auth mode
- Render the screen matching that mode (loading, locked, login, logout, quota, terms of service)
- Drive the login card through its steps (user/pass, OAuth, SAML, OTP, security token, sign-up, password reset)
- Persist login providers and clear the cached session on an unauthorized response
- Retry while the server is unreachable or a concurrent quota is in effect

## Auth Modes

`auth.mode` lives in the interface store and decides what `AppAuthLayout` renders.

| Mode      | Screen        | Set by                                              |
| --------- | ------------- | --------------------------------------------------- |
| `app`     | `children`    | `whoami` 200 with terms accepted (or terms off)     |
| `loading` | `LoadingPage` | initial state, malformed response, concurrent quota |
| `locked`  | `LockedPage`  | `whoami` 403                                        |
| `login`   | `LoginPage`   | `whoami` 401, or an SSO callback in progress        |
| `logout`  | `LogoutPage`  | user action, or a 401 on any other API call         |
| `quota`   | `QuotaPage`   | `whoami` 503 with a daily API quota error           |
| `tos`     | `ToSPage`     | `whoami` 200 with terms outstanding                 |

## Key Files

- `auth.providers.tsx` — `AppAuthLayout`, the mode-to-screen switch
- `auth.hooks.tsx` — `useAuthQuery` (whoami lifecycle), `useIsAuthenticating`, `useAuthenticating`, `useIsAppReady`, `useScoreToVerdict`
- `auth.models.ts` — API envelope and login parameter types
- `auth.utils.ts` — `normalizeWhoAmI`, property flattening and validation helpers
- `loading/` — splash screen shown while auth resolves
- `locked/` — account locked screen
- `log-in/` — login card, its steps, form store and field validation
- `log-out/` — logout screen that ends the session
- `quota/` — daily quota exceeded screen
- `terms-of-service/` — terms acceptance screen

## whoami Lifecycle

`useAuthQuery` owns `/api/v4/user/whoami/` and is the only place the auth mode is derived from the API.

- Quota headers are pushed to the interface store on every response
- A network failure or a 502 is reported as unreachable and retried with backoff
- A 401 caches the login providers in `localStorage`, clears `sessionStorage` (which holds the persisted query cache) and switches to `login`
- A 403 stores the returned configuration and switches to `locked`
- A daily quota 503 switches to `quota` and stops; any other quota 503 waits on `loading` and retries
- A 200 stores the user, marks Clue ready and switches to `tos` or `app`

## SSO Callbacks

While the URL is an `/oauth/` or `/saml/` callback — or `auth.disableWhoAmI` is set — `useIsAuthenticating` pauses the `whoami` query so the callback can be exchanged for a token. `useAuthenticating` forces `login` mode during that window and rehydrates the login providers from `localStorage`, since no fresh 401 will arrive to supply them.
