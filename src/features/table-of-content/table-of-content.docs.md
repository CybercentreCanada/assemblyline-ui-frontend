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

`TableOfContentFormProvider` owns the form-backed store. `TableOfContentProvider` consumes that store and provides the table-of-content context, including the scroll-root and header refs. `TableOfContentLayout` composes both providers in the required order and accepts an optional scroll behavior.

### Anchor

`Anchor` renders a `div` with a generated or supplied `data-anchor` identifier. When enabled, it registers its label and subsection state with the nearest table-of-content provider and removes its registration when unmounted.

### TableOfContentContext

The context exposed by `TableOfContentProvider` exposes:

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
import { Anchor, TableOfContentLayout, useTableOfContent } from 'features/table-of-content';

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

const DocumentContent = () => {
  const { rootRef, headerRef } = useTableOfContent();

  return (
    <div ref={rootRef} style={{ height: '100vh', overflowY: 'auto' }}>
      <header ref={headerRef} style={{ position: 'sticky', top: 0 }}>
        <Navigation />
      </header>
      <main>
        <Anchor anchor="overview" label="Overview">
          <section>Overview</section>
        </Anchor>
        <Anchor anchor="details" label="Details" subheader>
          <section>Details</section>
        </Anchor>
      </main>
    </div>
  );
};

const Document = () => (
  <TableOfContentLayout>
    <DocumentContent />
  </TableOfContentLayout>
);
```

Use `TableOfContentLayout` for standalone usage; it mounts `TableOfContentFormProvider` above `TableOfContentProvider`. Call `useTableOfContent` from a descendant of the layout, then attach `rootRef` to the scrollable element containing the anchors and `headerRef` to its fixed or sticky header. Anchor registration, active-section tracking, and scrolling depend on those refs being attached.

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

`TableOfContentFormProvider` creates and owns the form store. `TableOfContentLayout` composes it above `TableOfContentProvider`, which consumes the store and exposes the table-of-content context. Descendants call `useTableOfContent` to access that context and attach its refs to the scroll root and header. Each `Anchor` discovers the nearest context and registers after mounting; registration scans the root for anchor elements and updates the form store. Scroll events use the root and header geometry to update the active anchor, while `scrollTo` navigates within that root.

## 7. Related Modules

- `features/form/` - Provides the form-backed state context used by the table-of-content provider
- `ui/layouts/PageSection.tsx` - Uses `Anchor` to mark page sections
- `core/routes/` - Hosts route pages that consume table-of-content navigation
