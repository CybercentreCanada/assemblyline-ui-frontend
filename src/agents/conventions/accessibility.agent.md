# Accessibility — AI Rules

## Must

- Every icon-only button must have `aria-label`
- Every `<img>` must have `alt` (empty `""` for decorative)
- Every form input must have `<label>` or `aria-label`
- Every toggle/accordion trigger must have `aria-expanded`
- Every dynamically updating region must have `aria-live="polite"` or `"assertive"`
- Every modal must trap focus and return focus on close
- All interactive elements must be reachable via keyboard (Tab, Enter, Escape)
- Headings must follow level order — never skip levels
- Use `theme.palette` for all colors — never hardcode hex/rgb

## Never

- Never use `<div onClick>` — use `<button>` for actions
- Never use `<div role="navigation">` — use `<nav>`
- Never omit `aria-label` on icon buttons
- Never rely on color alone to convey information
- Never use CSS classes or DOM structure for E2E locators

## Semantic HTML

| Need | Use | Not |
|------|-----|-----|

| Action | `<button>` | `<div onClick>` |
| Navigation | `<nav>` | `<div role="navigation">` |
| Main content | `<main>` | `<div role="main">` |
| Heading | `<h1>`–`<h6>` | `<div aria-level>` |
| List | `<ul>`/`<ol>` + `<li>` | nested `<div>` |
| Table | `<table>` | grid of `<div>` |

## ARIA Patterns

```typescript
// Icon button
<button aria-label={t('action.close')} onClick={handleClose}>
  <CloseIcon />
</button>

// Button with loading state
<button
  aria-label={t('action.submit')}
  aria-disabled={isPending}
  aria-busy={isPending}
  disabled={isPending}
>

// Expandable section
<button aria-expanded={isOpen} aria-controls="panel-id">
<div id="panel-id" role="region" aria-hidden={!isOpen}>

// Live region
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Form field with help text
<input aria-label={t('field.label')} aria-describedby="help-id" />
<span id="help-id">{helpText}</span>
```

## Keyboard Template

```typescript
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  }}
>
```

## E2E Locator Priority

1. `getByRole()` — roles + aria labels (preferred)
2. `getByLabel()` — `aria-label` or `<label>`
3. `getByText()` — visible text
4. `getByTestId()` — `data-testid` fallback (kebab-case, last resort)
