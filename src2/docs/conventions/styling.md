# Styling Conventions

## Purpose

Performance is the priority. MUI components carry significant overhead compared to raw HTML elements — every `Box`, `Stack`, or `Grid` adds runtime cost through emotion's CSS-in-JS engine. Use MUI primarily for its **behavior** (button ripple effects, typography scaling, form controls, transitions) rather than as generic layout wrappers.

For layout and structure, prefer raw HTML elements with the `style` prop. Reserve MUI components for when you actually need their built-in behavior.

## Performance Rules

MUI components are measurably slower than raw HTML. Follow these rules:

| Scenario | Approach |
|----------|----------|
| Single-use layout element | Raw HTML tag + `style` prop |
| Reusable styled element (used in multiple places) | `styled('div')` from MUI |
| 10+ instances rendered at once (lists, grids, rows) | Raw HTML tag + `style` prop — never MUI |
| Need MUI behavior (ripple, typography, transitions) | Use the MUI component |

```typescript
// ✅ Raw div for a one-off layout container
<div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
  {children}
</div>

// ✅ Raw elements in a list (10+ items)
{items.map(item => (
  <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
    <span style={{ flex: 1 }}>{item.label}</span>
  </div>
))}

// ✅ MUI for its behavior (ripple, disabled state, loading)
<Button onClick={handleSubmit}>Submit</Button>

// ✅ MUI Typography for its variant system
<Typography variant="h6">{title}</Typography>

// ❌ MUI Box just for a div with styling — use a raw div instead
<Box sx={{ display: 'flex', gap: 2, p: 1 }}>{children}</Box>

// ❌ MUI Stack just to stack elements — use a raw div with flexbox
<Stack spacing={2}>{children}</Stack>
```

## When to Use MUI Components

Only use MUI components when you need their **specific behavior**, not just their styling:

| MUI Component | Use When You Need |
|---------------|-------------------|
| `Button` | Ripple effect, disabled state, loading indicator |
| `Typography` | Variant system, responsive font scaling |
| `TextField` | Input behavior, labels, error states, adornments |
| `Dialog` | Modal backdrop, focus trap, escape-to-close |
| `Drawer` | Slide animation, backdrop, responsive breakpoints |
| `Tooltip` | Hover/focus triggering, positioning, delays |
| `Tabs` / `Tab` | Indicator animation, keyboard navigation |
| `IconButton` | Ripple, accessibility, size variants |

Do **not** use `Box`, `Stack`, `Grid`, or `Paper` as layout primitives — use raw `div`/`span` with `style` instead.

## Styling Methods

### 1. `style` prop — Default for single-use elements

The default approach for any element that doesn't need reuse. Fastest possible rendering:

```typescript
<div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
  <span style={{ fontWeight: 500 }}>{title}</span>
</div>
```

**When to use:** Any single-instance layout element, list items, wrappers, containers.

### 2. `styled()` — Reusable styled components

Use for components with complex styles or styles shared across multiple instances:

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

**When to use:** Reusable layout primitives, components with many CSS properties, styles that need theme access.

**Rules for `styled()`:**
- Wrap in `memo()` for consistency with all other components
- Set `displayName` like any other component
- Always access colors, spacing, and breakpoints from the `theme` parameter
- Use the callback form `(({ theme }) => ({ ... }))` to access theme values

### 3. `styled()` with custom props

When a styled component needs custom props for conditional styling:

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

**Rules:**
- Use `shouldForwardProp` to prevent custom props from reaching the DOM
- Type the custom props with a generic on `styled`

## Theme Access

Always access design tokens from the theme — never hardcode colors, spacing, or breakpoints:

```typescript
// ✅ Use full theme tokens — never shorthand
styled('div')(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

// ❌ Never use sx shorthand (p, m, gap as numbers)
<Box sx={{ p: 2, m: 1 }} />

// ❌ Never hardcode values
styled('div')(() => ({
  color: '#333',
  padding: '16px',
  borderRadius: '4px',
}));
```

**Rules:**
- Always use `theme.spacing()` for spacing values — not raw pixel numbers
- Always use `theme.palette.*` for colors — not hex/rgb values
- Always use `theme.breakpoints.*` for responsive queries
- Use the explicit token form (`theme.spacing(2)`) — never the shorthand number form

## Responsive Design

Use MUI's breakpoint system in `styled()` components for responsive layouts:

```typescript
// In styled components
styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1fr 1fr',
  },
}));

// Via useMediaQuery hook
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
```

## What NOT to Use

| Forbidden | Why |
|-----------|-----|
| Raw CSS files (`.css`, `.scss`) | No theme integration, no type safety |
| CSS Modules | Same as above, plus adds build complexity |
| Tailwind CSS | Conflicts with MUI's design system |
| Direct `@emotion/react` or `@emotion/styled` imports | Use MUI's `styled` re-export instead |
| `sx` prop | Performance overhead — use `style` prop or `styled()` instead |
| `Box`, `Stack`, `Grid` as layout wrappers | Use raw `div` with `style` — significantly faster |
| `!important` | Indicates a specificity problem — fix the root cause instead |
