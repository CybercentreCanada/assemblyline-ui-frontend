# Features/Table-Of-Content

## 1. Purpose

Provides a scroll-aware table-of-content layout and context for registering document anchors, tracking the active section, and navigating within a scrollable content root.

## 2. Features

- **Anchor registration** - Registers anchors with an identifier, label, and subsection state
- **Active-section tracking** - Detects the visible section while the content root scrolls
- **Anchor navigation** - Scrolls to registered anchors while accounting for the header height
- **Reactive rendering** - Exposes render-prop helpers for the current anchors and active state
- **Typed context** - Shares refs and table-of-content operations through a typed provider

## 3. Concepts

### TableOfContentProvider

`TableOfContentFormProvider` owns the form-backed store. `TableOfContentProvider` must be rendered beneath it; it consumes the store and exposes the table-of-content context. `TableOfContentLayout` composes both providers in the required order and forwards the optional scroll behavior. Use the layout for standalone usage.

### Anchor

`Anchor` renders a `div` with a generated or supplied `data-anchor` identifier. When enabled, it registers its label and subsection state with the nearest table-of-content provider and removes its registration when unmounted.

### TableOfContentContext

`useTableOfContent` returns the context exposed by `TableOfContentProvider`:

- `rootRef` - Scrollable content root reference
- `headerRef` - Header reference used to offset navigation and active-section detection
- `loadAnchors` - Registers or refreshes an anchor list
- `scrollTo` - Navigates to an anchor
- `Anchors` - Renders the current anchor list
- `ActiveAnchor` - Renders content based on whether an anchor is active

## 4. Configuration

### TableOfContentProviderProps

This type is shared by `TableOfContentProvider` and `TableOfContentLayout`.

| Prop | Required | Default | Behavior |
| --- | --- | --- | --- |
| `behavior` | No | `'smooth'` | Scroll behavior used by `scrollTo` |
| `children` | No | `undefined` | Content rendered inside the provider |

### AnchorProps

`Anchor` accepts normal `HTMLDivElement` attributes plus:

| Prop | Required | Default | Behavior |
| --- | --- | --- | --- |
| `anchor` | No | Generated ID | Explicit anchor identifier |
| `label` | No | `''` | Label registered in the table of contents; non-string and non-number values register as an empty label |
| `subheader` | No | `false` | Marks the anchor as a subsection |
| `disabled` | No | `false` | Renders children without registering an anchor |

Even when `disabled` is true, `Anchor` must be rendered beneath a table-of-content provider because it reads the context before checking this prop.

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
                <a
                  href={`#${anchor.id}`}
                  aria-current={active ? 'location' : undefined}
                  onClick={event => scrollTo(event, anchor.id)}
                >
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

Call `useTableOfContent` from a descendant of `TableOfContentLayout` or a correctly composed provider pair. Attach `rootRef` to the scrollable element containing the anchors and `headerRef` to its fixed or sticky header. Anchor registration, active-section tracking, and scrolling depend on these refs being attached.

## 6. Codebase (Internals)

### Key Files

| File | Role |
| --- | --- |
| `table-of-content.models.ts` | Anchor and store types |
| `table-of-content.providers.tsx` | Form-backed store provider, context, provider props, context hook, and layout |
| `table-of-content.components.tsx` | Anchor registration component and `AnchorProps` |
| `index.ts` | Explicit public exports |

### Data Flow And Boundaries

`TableOfContentFormProvider` creates the form store, and `TableOfContentProvider` exposes it through the table-of-content context. `TableOfContentLayout` composes the providers for standalone use. Consumers attach the context refs to the scroll root and header. Each enabled `Anchor` registers after mounting; registration scans the root for `[data-anchor]` elements and updates the store. Scroll events use root and header geometry to update the active anchor, while `scrollTo` navigates within the root and accounts for the header height.

## 7. Related Modules

- `features/form/` - Provides the form-backed state context used by the table-of-content provider
- `ui/layouts/PageSection.tsx` - Uses `Anchor` to mark page sections
- `routes/` - Contains application route pages, some of which use table-of-content navigation
