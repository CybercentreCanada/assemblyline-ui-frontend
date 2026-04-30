# layout/router

Router layout that visually renders route panels using the portal system. Manages the visual representation of the multi-panel router — displaying split views, tab bars, and panel chrome.

## Responsibilities

- Panel visual rendering (split views, single panel, maximized panel)
- Portal-based panel content mounting
- Panel chrome (tab bar, close button, split controls)
- Integration with `core/router` store for panel state

## Key Files

- `router.layout.tsx` — Main router layout component managing panel display
