# Accessibility

## Purpose

Accessibility is the highest priority. Every component must be usable by screen readers, keyboard-only users, and users with visual impairments. Aria attributes serve a dual purpose — they make the app accessible AND provide reliable locators for E2E testing.

## Aria Attributes

Add `aria-*` attributes to every interactive and meaningful element. These attributes also enable reliable E2E testing — Playwright can detect component states (disabled, loading, busy) through aria attributes without relying on CSS classes or DOM structure.

```typescript
// ✅ Buttons with clear labels
<button aria-label="Close notification panel" onClick={handleClose}>
  <CloseIcon />
</button>

// ✅ Button states — detectable in E2E tests via aria attributes
<button
  aria-label="Submit form"
  aria-disabled={isPending}
  aria-busy={isPending}
  disabled={isPending}
  onClick={handleSubmit}
>
  {isPending ? 'Submitting...' : 'Submit'}
</button>

// ✅ Regions with roles and labels
<nav aria-label="Main navigation">
  {menuItems}
</nav>

// ✅ Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// ✅ Form fields with labels
<input
  id="search-input"
  aria-label="Search submissions"
  aria-describedby="search-help"
/>
<span id="search-help">Enter a SHA256 hash or filename</span>

// ✅ Expandable sections
<button aria-expanded={isOpen} aria-controls="panel-content">
  Details
</button>
<div id="panel-content" role="region" aria-hidden={!isOpen}>
  {content}
</div>
```

**Required aria attributes:**
- `aria-label` — on every icon button and non-text interactive element
- `aria-expanded` — on every toggle/accordion trigger
- `aria-hidden` — on decorative elements and hidden content
- `aria-live` — on regions that update dynamically (notifications, status messages)
- `aria-describedby` — on form fields that have help text or error messages
- `role` — when the semantic HTML element doesn't convey the right role

## Semantic HTML

Use the correct HTML element before reaching for aria attributes:

| Need | Use | Not |
|------|-----|-----|
| Navigation | `<nav>` | `<div role="navigation">` |
| Main content | `<main>` | `<div role="main">` |
| Section heading | `<h1>`–`<h6>` | `<div aria-level="1">` |
| Button | `<button>` | `<div onClick>` |
| List | `<ul>` / `<ol>` + `<li>` | `<div>` with divs inside |
| Table | `<table>` | `<div>` grid layout pretending to be a table |

## Keyboard Navigation

All interactive elements must be keyboard-accessible:

- Focusable via `Tab` / `Shift+Tab`
- Activatable via `Enter` or `Space`
- Dismissible via `Escape` (dialogs, drawers, menus)
- Arrow key navigation within lists, tabs, and menus

```typescript
// ✅ Keyboard handler on custom interactive elements
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  }}
>
  {label}
</div>
```

## E2E Locator Strategy

Aria attributes and `data-testid` provide reliable locators for Playwright POMs. Prefer semantic locators over test-specific attributes when possible:

**Locator priority (best to worst):**
1. `getByRole()` — uses aria roles and labels (best: accessible AND testable)
2. `getByLabel()` — uses `aria-label` or associated `<label>`
3. `getByText()` — visible text content
4. `getByTestId()` — `data-testid` attribute (fallback when no semantic locator works)

```typescript
// ✅ POM using semantic locators (preferred)
get closeButton() {
  return this.page.getByRole('button', { name: 'Close notification panel' });
}

get searchInput() {
  return this.page.getByLabel('Search submissions');
}

get navigationMenu() {
  return this.page.getByRole('navigation', { name: 'Main navigation' });
}

// ✅ data-testid as fallback for complex or repeated elements
get itemRows() {
  return this.page.getByTestId('item-row');
}
```

**Rules for `data-testid`:**
- Use when no semantic locator is available (e.g., generic containers, repeated items in lists)
- Name format: `kebab-case` describing the element's purpose
- Add directly to the DOM element: `<div data-testid="alert-details-panel">`
- Never use CSS classes for locating — they change with styling
- Never rely on DOM structure (nth-child, parent > child) — it's brittle

**Adding aria attributes gives you both accessibility and testability for free.** This is why it's the highest priority — one effort covers two concerns.

## Colors and Contrast

Rely on MUI's theme palette for color choices — the default palettes are designed to meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text). When using raw HTML elements with the `style` prop:

- Always use theme palette colors accessed via `useTheme()`:
  ```typescript
  const theme = useTheme();
  // ✅ Theme colors maintain proper contrast in both light and dark modes
  <div style={{ color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper }}>
  ```
- Never hardcode colors — they won't adapt to dark mode and may fail contrast checks
- For status colors (error, warning, success), use `theme.palette.error.main`, `theme.palette.warning.main`, etc.
- For text on colored backgrounds, use `theme.palette.error.contrastText`, etc.
