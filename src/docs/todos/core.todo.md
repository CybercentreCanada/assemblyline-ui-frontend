# TODO — Core Modules

Tasks related to `src2/core/` (api, assistant, config, error, interface, preference, router, routes, snackbar, template, theme).

## Pending

- [ ] **Port `AssistantProvider`** — Migrate the full AI assistant implementation from `src/components/providers/AssistantProvider.tsx` to `src2/core/assistant/`. The old implementation includes:
  - Chat UI (Popper + Backdrop + FAB)
  - Insight system (file, submission, report, code insights with chip triggers)
  - Conversation history + context management
  - API calls to `/api/v4/assistant/`, `/api/v4/submission/ai/`, `/api/v4/file/ai/`, `/api/v4/file/code_summary/`
  - Role gating (`assistant_use` + `configuration.ui.ai.enabled`)
  - Reset/clear conversation actions
  - Currently uses `useMediaQuery` (needs `useAppMediaQuery` replacement)

- [ ] **Port `BorealisProvider`** — Integrate the `borealis-ui` `BorealisProvider` into the `src2/` app template. Currently wired in `src/commons/components/app/AppProvider.tsx` with config:
  - `baseURL`: `location.origin + '/api/v4/proxy/borealis'`
  - `getToken`: `() => null`
  - `chunkSize`: 200, `maxRequestCount`: 3, `defaultTimeout`: 60
  - Should be placed in `src2/app/` template provider tree or a new `core/borealis/` module

## Completed
