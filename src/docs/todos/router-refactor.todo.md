# Tasklist — Router Refactor (2026-07-16)

Status legend:
- 🚫 Not planned
- ✅ Completed
- 🟡 In progress
- ⬜ Not touched

## �️ Layout & Scrolling

- ✅ Create the `AppRouteLayoutProvider` to handle route-level scrolling behavior, including scroll restoration and hash-based scrolling.
- ✅ Move scrolling from the panel level to the route level.
- ✅ Fix panel scrolling: make the panel take the whole height of the page.
## 📱 Page-Level Responsive Design

- ✅ Create a custom `useAppMediaQuery` hook that wraps individual pages, not the whole interface.
- ✅ Allow each page to independently respond to media query changes without affecting global layout.
## 🚨 Priority 1 – Navigation Risk & Data-Loss Guards

- ✅ Ensure page refresh/close blockers continue to work when required.
- ✅ Stop clearing Navigation Store after applying it to Router Store; always keep the latest navigation changes and diff against Router Store using navigation `id`.
- ✅ Add an `only` navigation target mode that clears existing pages and opens only the selected destination pages.
- 🟡 Replace the narrow "blocked routes" concept with a broader navigation-risk model that can represent multiple risk reasons per route.
- 🟡 Define a typed risk taxonomy for navigation requests: `unsaved_changes`, `transient_loss_on_leave`, `state_or_transient_loss_on_new_tab`, and `external_leave_risk`.
- 🟡 Add a central way to annotate and aggregate risk reasons for a page so risks are discoverable and debuggable from router/navigation state.
- 🟡 Verify that pending navigations remain in the Navigation Store until accepted or cancelled, including risk metadata.
- 🟡 Support navigation with raw string destinations in addition to app route values (for `create`/`update` flows).
- 🟡 Support passing React Router `Location` objects to `navigate.create/update` and parse them into app route values (legacy fallback, lower type safety).
- 🟡 Implement and verify all `AppNavigateOptions` fields end-to-end (`hashScrollIntoView`, `href`, `ignoreBlocker`, `reloadDocument`, `replace`, `resetScroll`, `viewTransition`).
- 🟡 Extend navigation options so callers can explicitly bypass selected risk guards when consequences are understood (for example `ignoreRisk` by reason and `forceProceed`).
- 🟡 Add route-level loader execution in `createAppRoute` at navigation start (before page render) to prefetch API data with TanStack Query so data is available earlier in the pipeline.
- ⬜ Refactor `<AppNavigate />` to render through React Router `<Navigate />` under the hood instead of triggering navigation from `useLayoutEffect`.
- ⬜ Add external-link safety prompt for unsafe destinations: show a confirmation dialog before leaving the app instance (e.g. "You are leaving this app and navigating to an unsafe link. Are you sure you want to proceed?").
- ⬜ Add an unsaved-changes warning dialog for refresh/close/navigation-away requests that explains data will be lost unless the user confirms.
- ⬜ Add a transient-data warning dialog for refresh/close/navigation-away requests when the current page contains transient values that will be lost.
- ⬜ Add internal-link new-tab warning with automatic detection: when opening an internal route in another tab/window, warn if the link carries `state` or `transient` data since those values are not reliably transferred.
- ⬜ Add a new-tab warning dialog when the destination includes `state` or `transient` values, and clearly explain those values will be lost in the new tab/window.
- ⬜ Add an external-link leave-page warning dialog/popper that informs users they are leaving the app and proceeding at their own risk.
- ⬜ Add a leave-page warning when route `state` or `transient` values may be lost during same-tab navigation.
- ⬜ Add risk-priority and dialog-resolution rules for overlapping risks (for example unsaved changes and transient loss at the same time).
- ⬜ Add explicit "Proceed anyway" actions for each warning/blocker dialog so users can acknowledge and continue with the current navigation request.
- ⬜ Add per-request and per-reason skip controls (for example skip once, skip for session, optional "don't ask again" where policy allows).
- ⬜ Add audit/debug metadata when a warning/blocker is bypassed (who, which risk reason, and how it was overridden).
## 🔍 Priority 2 – Simplify the Search Parameter Engine

- 🚫 Simplify the implementation of the search params parser. (Not going to be implemented)
- 🚫 Remove `useAppSearchSnapshot` and migrate usage to on-the-fly derived values. (Not going to be implemented)
- ✅ Start wiring the new hash/state/transient parsers and params into [routes.utils.tsx](/home/njrheau/git/frontend1/src/core/routes/routes.utils.tsx); more integration work is still needed.
- ✅ Refactor the search parameter engine so it is only responsible for search parameters.
- ✅ Move higher-level state resolution into the router/navigation infrastructure.
- ✅ **Store search snapshot in LocationParam** — Update the LocationParam store to store both:
  - The search param string (as it currently does)
  - The search snapshot from the Search Param Engine (resolved state that pages can consume directly)
  - Allows pages to use pre-computed search state without re-parsing params
- ✅ Remove explicit `searchSnapshot` from route param models and infer/calculate snapshot from `search` on demand.
- ✅ Keep the search parameter engine focused and composable.
- ✅ Remove responsibility for resolving location state and snapshot state.

## 🔨 Priority 2b – Parser Implementations

- ✅ Implement the hash param parser.
- ✅ Implement the `hash-params.codec.ts` hash param codec.
- ✅ Implement the state param parser.
- ✅ Implement the `state-params.codec.ts` state param codec for parsing `location.state` and transient data.
- ✅ Implement the temp param parser.
- ✅ Add `hash`, `state`, and `transient` params to `InferAppLocationFromPath` and `InferAppRouteParamFromPath`.
- ✅ Add URI encoding and decoding to the search param parser.
- ✅ Add support in the search param parser for a new object blueprint type.

## 🧭 Priority 2c – Cross-Panel Route Context APIs

- ✅ Changed the `useAppLocation` to select which target to read the AppRouteValues from other panel contexts (`from`, `to`, `here`, `at`).
- ⬜ Add helpers for active-state derivation based on values from other routes/pages.
- ⬜ Add self-injecting props support to `<AppLink />` so custom props can be computed from other route values.

## 🔔 Priority 3 – Alerts Page

- ⬜ Complete the Alerts page migration.
- ⬜ Validate redirects.
- ⬜ Verify interaction with the simplified search parameter engine.
- ⬜ Explore page-to-page communication using TanStack Query or the router.

## 🧩 Priority 4 – Hash Parameter Support

- ✅ Implement a hash fragment parser/codec similar to the path parameter parser.
- ✅ Validate hash encoding/decoding.
- ✅ Test with the documentation page to ensure automatic scrolling to anchors.

## 📄 Priority 5 – Page Metadata

- ✅ Add page title support.
- ✅ Add a function that updates `document.title` from the active route spec's `title`.
- ✅ Add browser/document title support.
- ✅ Add page icons.
- ⬜ Add i18n identifiers for page names.
- ⬜ Define how page labels are presented throughout the application.

## 🔐 Priority 6 – Page Accessibility

- ✅ Support forbidden pages.
- ✅ Create a `<MissingNodePage />` to render when a router portal is missing its node.
- ✅ Support Not Found pages.
- ✅ Support Not Mounted pages.
- ✅ Determine how authorization requirements are expressed in route definitions.
- ✅ Support disabled pages.
- 🟡 Start setting the `forbidden` parameter in `createAppRoute` on pages and continue rolling it out across the remaining routes.
- 🟡 Show the Not Found route when no route matches during route resolution.
- 🟡 Show the Not Found page when an invalid page is calculated during routing, instead of filtering that page out.
- ⬜ Define page accessibility requirements.
- ⬜ Add fallback page handling when an invalid page is provided (or define and implement all potential fallback pages).
- ⬜ In AppLocationParamProvider, add configurable fallback overrides for Not Found and Forbidden pages.
- ⬜ Add blocked-page reason support so the UI can explain why access/navigation was blocked.
- ⬜ Add wildcard-like route fallback support (similar to React Router `*`) so navigating to a route not present in the spec registry resolves to the Not Found page.
## ⚙️ Priority 7 – Search Parameter Defaults

- ⬜ Verify pages can define default search parameter values.
- ⬜ Ensure defaults can be updated dynamically where appropriate.

## 🧪 Priority 8 – Codec Improvements

- ✅ Add `hashObjectKeyOrderIndependent()` so route digests can be derived predictably regardless of object key insertion order.
- ✅ Continue validating the enum codec implementation.
- ✅ Add a generic `any`/object codec for strongly typed arbitrary values.

## 🧾 Consolidated Routing Items

- ✅ Implement proper `403 Forbidden` handling that renders at the requested URL rather than redirecting.
- ✅ Rename `del` to `removePanel` in the navigation API.
- ✅ Add `updateSearch` for directly mutating search parameters.
- ✅ Refactor navigation internals to reduce unnecessary object spreading/reconstruction.
- ✅ Remove route `state` and migrate behavior to the `search` codec.
- ✅ Remove route `transient` and migrate behavior to the `search` codec.
- ✅ Ensure search codec primitives (strings, numbers, booleans) are consistently supported.
- ✅ Routing model target: path identifies the page.
- ✅ Routing model target: search contains route state.
- ✅ Routing model target: hash identifies in-page location.
- ✅ Routing model target: scroll is transient UI state managed separately.

- ⬜ Consider `401 Unauthorized` and `500 Error` handling if not already covered.
- ⬜ Add search codec support for arrays.
- ⬜ Allow each search blueprint to define its own encode/decode behavior.
- ⬜ Remove scroll position from persisted route state.
- ⬜ Treat scroll as transient UI state.
- ⬜ Apply scroll behavior independently instead of serializing it into route data.
- ⬜ Keep `hash` only for in-page anchors/sections.
- ⬜ Avoid using `hash` for application state.
## 💭 Future Investigation (No implementation yet)

- ✅ Evaluate whether the router should support ephemeral (non-history) navigation state for page-to-page communication. -> that's the `transient` params
- ✅ Consider the implications of refreshes, browser back/forward navigation, and persistence.
- ⬜ Identify concrete use cases before committing to the API.
