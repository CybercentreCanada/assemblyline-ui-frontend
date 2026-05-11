# Styling Conventions

> Applies to: all `.tsx` files that render UI elements.

## Purpose

Styling decisions determine how elements are rendered. Use the decision table below to pick the right approach for each element.

## Decision Table

| Scenario | Approach |
|----------|----------|
| Single-use layout element | Raw HTML tag + `style` prop |
| Reusable styled element (multiple places) | `styled('div')` from MUI |
| 10+ instances rendered at once (lists, grids) | Raw HTML tag + `style` prop |
| Need MUI behavior (ripple, transitions) | Use the MUI component |

## When to Use MUI Components

Only when you need their **specific behavior**, not styling:

| MUI Component | Use When You Need |
|---------------|-------------------|
| `Button` | Ripple, disabled state, loading indicator |
| `Typography` | Variant system, responsive font scaling |
| `TextField` | Input behavior, labels, error states |
| `Dialog` | Modal backdrop, focus trap, escape-to-close |
| `Drawer` | Slide animation, backdrop |
| `Tooltip` | Hover/focus triggering, positioning |
| `Tabs` / `Tab` | Indicator animation, keyboard navigation |
| `IconButton` | Ripple, accessibility, size variants |

Do **not** use `Box`, `Stack`, `Grid`, or `Paper` as layout primitives.

## Styling Methods

### 1. `style` prop — Default for single-use

```typescript
<div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
  <span style={{ fontWeight: 500 }}>{title}</span>
</div>
```

### 2. `styled()` — Reusable elements

```typescript
export const Container = memo(
  styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  }))
);

Container.displayName = 'Container';
```

**Rules for `styled()`:**
- Wrap in `memo()` when exported
- Set `displayName`
- Access colors, spacing, breakpoints from `theme` parameter

### 3. `styled()` with custom props

```typescript
export const Panel = memo(
  styled('div', {
    shouldForwardProp: (prop) => prop !== 'open',
  })<{ open?: boolean }>(({ theme, open = false }) => ({
    width: open ? 300 : 0,
    transition: theme.transitions.create('width'),
    overflow: 'hidden',
  }))
);

Panel.displayName = 'Panel';
```

Use `shouldForwardProp` to prevent custom props from reaching the DOM.

## Theme Access

Always use theme tokens — never hardcode:

```typescript
styled('div')(({ theme }) => ({
  color: theme.palette.text.primary,        // ✅
  padding: theme.spacing(2),                // ✅
  borderRadius: theme.shape.borderRadius,   // ✅
}));
```

- `theme.spacing()` for spacing
- `theme.palette.*` for colors
- `theme.breakpoints.*` for responsive queries
- `theme.shape.*` for border radius
- `theme.transitions.*` for animations

## Responsive Design

```typescript
styled('div')(({ theme }) => ({
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1fr 1fr',
  },
}));
```

## Forbidden

| Forbidden | Why |
|-----------|-----|
| `sx` prop | Performance overhead |
| `Box`, `Stack`, `Grid` | Use raw div with `style` |
| Raw CSS / SCSS / Modules | No theme integration |
| Tailwind | Conflicts with MUI |
| Direct `@emotion` imports | Use MUI's `styled` re-export |
| Hardcoded hex/rgb/pixels | Use theme tokens |
| `!important` | Fix specificity at the root |
