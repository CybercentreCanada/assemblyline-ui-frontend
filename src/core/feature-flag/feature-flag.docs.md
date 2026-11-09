# Feature Flags

Feature flags control access to experimental frontend behaviour while features
are being developed and tested.

- Use `useIsFeatureEnabled` for conditional behaviour or `FeatureFlagged` to
  conditionally render a component subtree.
- Unknown or missing flags are resolved as disabled.
- Store providers support scoped flag state, with administrator-only loading
  and saving of application flags in localStorage.
- Frontend flags are not authorization; backend permissions must still protect
  restricted data and actions.

## Developer Guide

Visit `/development/feature-flags` for setup guidance, API examples, and live
demonstrations. The page is available to administrators in development and
staging environments.

See the [development route](../../routes/development-feature-flags/development-feature-flags.route.tsx)
for its implementation.
