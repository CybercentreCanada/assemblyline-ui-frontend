# features/table-of-content

Table of contents component with anchor tracking. Automatically highlights the active section as the user scrolls and provides navigation links to document sections.

## Responsibilities

- Anchor registration and tracking within a scrollable container
- Active section detection based on scroll position
- Table of contents navigation UI with active state highlighting

## Key Files

- `Anchor.tsx` — Anchor point component that registers itself for tracking
- `TableOfContent.tsx` — Table of contents navigation component with active ID management
