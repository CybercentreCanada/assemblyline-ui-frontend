# TODO — Core Modules

Tasks related to `src/core/` (api, assistant, config, error, interface, preference, router, routes, snackbar, template, theme).

## Pending

- [ ] **Make `createAppRoute` metadata search-aware** — Refactor `createAppRoute` so `title` and `icon` can be derived from current search params (not only static values). This is required to support breadcrumb labels/icons that reflect route state.

- [ ] **Build breadcrumb model from route metadata** — Standardize breadcrumb generation around route `ancestor`, `title`, and `icon` metadata so page navigation can be composed consistently from route definitions.

- [ ] **Restore pre-refactor color behavior** — Audit current theme token usage across route/layout surfaces and re-align colors to previous visual behavior where regressions were introduced.

- [ ] **Port `AssistantProvider`** — Migrate the full AI assistant implementation from `src/components/providers/AssistantProvider.tsx` to `src/core/assistant/`. The old implementation includes:

  - Chat UI (Popper + Backdrop + FAB)
  - Insight system (file, submission, report, code insights with chip triggers)
  - Conversation history + context management
  - API calls to `/api/v4/assistant/`, `/api/v4/submission/ai/`, `/api/v4/file/ai/`, `/api/v4/file/code_summary/`
  - Role gating (`assistant_use` + `configuration.ui.ai.enabled`)
  - Reset/clear conversation actions
  - Currently uses `useMediaQuery` (needs `useAppMediaQuery` replacement)

- [ ] **Port `BorealisProvider`** — Integrate the `borealis-ui` `BorealisProvider` into the `src/` app template. Currently wired in `src/commons/components/app/AppProvider.tsx` with config:
  - `baseURL`: `location.origin + '/api/v4/proxy/borealis'`
  - `getToken`: `() => null`
  - `chunkSize`: 200, `maxRequestCount`: 3, `defaultTimeout`: 60
  - Should be placed in `src/app/` template provider tree or a new `core/borealis/` module

## Completed
