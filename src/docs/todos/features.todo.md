# TODO — Feature Modules

Tasks related to `src2/features/` (classification, form, path-params, portal, prop-provider, search-params, store, table-of-content).

## Pending

- [ ] **Port `ExternalLookupProvider`** — Migrate from `src/components/providers/ExternalLookupProvider.tsx` to a new `src2/features/external-lookup/` module. Provides:
  - `isActionable(category, type, value)` — checks if external query/links are available for a tag
  - `enrichTagExternal(source, tagName, tagValue, classification)` — triggers federated lookup via `/api/v4/federated_lookup/enrich/`
  - `getKey(tagName, tagValue)` — generates unique key for enrichment state
  - `enrichmentState` — record of all enrichment results by key/source
  - Depends on: user roles (`external_query`), `configuration.ui.external_sources`, `configuration.ui.external_source_tags`, `configuration.ui.external_links`

- [ ] **Port `HighlightProvider`** — Migrate from `src/components/providers/HighlightProvider.tsx` to a new `src2/features/highlight/` module. Provides:
  - `triggerHighlight(key)` — toggles highlight state via `CustomEvent` dispatch
  - `isHighlighted(key)` — checks if a key (or its related keys via highlight map) is active
  - `hasHighlightedKeys(keyList)` — batch check for any highlighted items
  - `setHighlightMap(map)` — sets relationship map between highlight keys
  - `getKey(type, value)` — generates `type__value` keys
  - Uses window `CustomEvent` for cross-component communication

- [ ] **Port `SafeResultsProvider`** — Migrate from `src/components/providers/SafeResultsProvider.tsx` to a new `src2/features/safe-results/` module (or integrate into `core/preference/`). Provides:
  - `showSafeResults` — boolean toggle (persisted to localStorage)
  - `toggleShowSafeResults()` — flips the value and persists
  - Consider: this may fit better as a preference in `core/preference/` rather than a standalone feature module

## Completed
