# Features/Table-Of-Content

## 1. Purpose

Provides a scroll-aware table-of-content context for registering document anchors, tracking the active section, and navigating to registered sections within a scrollable root.

## 2. Features

- **Anchor registration** - Registers anchors with an identifier, label, and subsection state
- **Active-section tracking** - Detects the visible section while the content root scrolls
- **Anchor navigation** - Scrolls to registered anchors while accounting for the header height
- **Reactive rendering** - Exposes render-prop helpers for the current anchors and active state
- **Typed context** - Shares refs and table-of-content operations through a typed provider

## 3. Concepts

### TableOfContentProvider

`TableOfContentProvider` creates the form-backed store and provides the table-of-content context to descendants. It accepts an optional scroll behavior and child content.

### Anchor

`Anchor` renders a `div` with a generated or supplied `data-anchor` identifier. When enabled, it registers its label and subsection state with the nearest table-of-content provider and removes its registration when unmounted.

### TableOfContentContext

The context exposes:

- `rootRef` - Scrollable content root reference
- `headerRef` - Header reference used to offset navigation and active-section detection
- `loadAnchors` - Registers or refreshes an anchor list
- `scrollTo` - Navigates to an anchor
- `Anchors` - Renders the current anchor list
- `ActiveAnchor` - Renders content based on whether an anchor is active

## 4. Configuration

### TableOfContentProps

| Prop | Required | Default | Behavior |
| --- | --- | --- | --- |
| `behavior` | No | `'smooth'` | Scroll behavior used by `scrollTo` |
| `children` | No | `undefined` | Content rendered inside the provider |

### AnchorProps

`Anchor` accepts normal `HTMLDivElement` attributes plus:

| Prop | Required | Default | Behavior |
| --- | --- | --- | --- |
| `anchor` | No | Generated ID | Explicit anchor identifier |
| `label` | No | `''` | Label registered in the table of contents |
| `subheader` | No | `false` | Marks the anchor as a subsection |
| `disabled` | No | `false` | Renders children without registering an anchor |

## 5. Usage

```tsx
import { Anchor, TableOfContentProvider, useTableOfContent } from 'features/table-of-content';

const Navigation = () => {
  const { ActiveAnchor, Anchors, scrollTo } = useTableOfContent();

  return (
    <nav>
      <Anchors>
        {anchors =>
          anchors.map(anchor => (
            <ActiveAnchor key={anchor.id} activeID={anchor.id}>
              {active => (
                <a href={`#${anchor.id}`} aria-current={active ? 'location' : undefined} onClick={event => scrollTo(event, anchor.id)}>
                  {anchor.label}
                </a>
              )}
            </ActiveAnchor>
          ))
        }
      </Anchors>
    </nav>
  );
};

const Document = () => (
  <TableOfContentProvider>
    <Navigation />
    <main>
      <Anchor anchor="overview" label="Overview">
        <section>Overview</section>
      </Anchor>
      <Anchor anchor="details" label="Details" subheader>
        <section>Details</section>
      </Anchor>
    </main>
  </TableOfContentProvider>
);
```

`useTableOfContent` must be called below `TableOfContentProvider`. The `rootRef` and `headerRef` from the context must be attached by the consumer to the scrollable root and its header for active tracking and offset scrolling to work.

## 6. Codebase (Internals)

### Key Files

| File | Role |
| --- | --- |
| `table-of-content.models.ts` | Shared anchor, store, context, and props types |
| `table-of-content.providers.tsx` | Context, form-backed state provider, and context hook |
| `components/Anchor.tsx` | Anchor registration component |
| `components/TableOfContent.tsx` | Table-of-content root and provider components |
| `index.ts` | Explicit public exports |

### Data Flow And Boundaries

`TableOfContentProvider` creates the state store and context. `Anchor` components discover the nearest context and register themselves after mounting. The root component scans registered DOM anchors when an anchor changes and stores their order. Scroll events calculate the active anchor from the root and header geometry, while `scrollTo` navigates to a selected anchor.

## 7. Related Modules

- `features/form/` - Provides the form-backed state context used by the table-of-content provider
- `ui/layouts/PageSection.tsx` - Uses `Anchor` to mark page sections
- `core/routes/` - Hosts route pages that consume table-of-content navigation
