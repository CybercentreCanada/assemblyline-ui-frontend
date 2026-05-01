# Styling — AI Rules

## Decision Table

| Scenario | Approach |
|----------|----------|
| Single-use layout element | Raw HTML + `style` prop |
| Reusable styled element | `styled('div')` from MUI |
| 10+ instances (lists, grids) | Raw HTML + `style` prop |
| Need MUI behavior (ripple, transitions) | Use MUI component |

## Raw HTML + `style` (default)

```typescript
<div style={{ display: 'flex', gap: 8, padding: 16 }}>
  {children}
</div>
```

## `styled()` for reusable elements

```typescript
const Row = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
}));

Row.displayName = 'Row';
```

## `styled()` with theme

```typescript
const ItemContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.75),
  padding: theme.spacing(1.25)
}));

ItemContainer.displayName = 'ItemContainer';
```

## `styled()` with custom props

```typescript
const Panel = styled('div', {
  shouldForwardProp: prop => prop !== 'open'
})<{ open?: boolean }>(({ theme, open = false }) => ({
  width: open ? 300 : 0,
  transition: theme.transitions.create('width'),
  overflow: 'hidden'
}));

Panel.displayName = 'Panel';
```

## Theme Access Rules

- `theme.spacing()` for spacing — never raw pixel numbers
- `theme.palette.*` for colors — never hex/rgb
- `theme.shape.*` for border radius
- `theme.transitions.*` for animations
- Access via `styled()` callback or `useTheme()` hook

## Forbidden

```typescript
// ❌ MUI layout components (Box, Stack, Grid)
<Stack direction="row"><Box>...</Box></Stack>

// ❌ Hardcoded design tokens
styled('div')(() => ({ color: '#333', padding: '16px' }));

// ❌ Missing displayName on styled components
const Row = styled('div')(() => ({ ... }));
```

## Required

- Wrap `styled()` components in `memo()` when exported
- Set `.displayName` on all styled components
- Use `shouldForwardProp` when adding custom props
