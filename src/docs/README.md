# Frontend Documentation

> Architecture, file-structure rules, and conventions for the frontend application.

## Structure

```
src/docs/
├── architecture.docs.md              ← Layer rules, project structure
├── file-structure.docs.md            ← File naming, module layout
├── file-structure/                    ← How to write specific file types
│   ├── components.docs.md
│   ├── hooks.docs.md
│   ├── i18n.docs.md
│   ├── models.docs.md
│   ├── utils.docs.md
│   ├── utils.test.docs.md
│   ├── pom.docs.md
│   └── spec.docs.md
└── conventions/                       ← Cross-cutting quality & style
    ├── accessibility.docs.md
    ├── imports.docs.md
    ├── performance.docs.md
    ├── react.docs.md
    └── styling.docs.md
```

## File Suffixes

- **`.docs.md`** (in `src/docs/`) — Human-readable explanations with context (150–300 lines)

## Folder Purpose

- **Root level** (`architecture`, `file-structure`): explain the project as a whole
- **`file-structure/`**: how to write code in specific file types (components, hooks, models, etc.)
- **`conventions/`**: cross-cutting concerns that apply broadly (performance, styling, state, accessibility)

## Audience

| Reader | Use |
|--------|-----|
| New developer | `src/docs/*.docs.md` files — start with architecture, then file-structure |
| Returning developer | Relevant `*.docs.md` for the topic at hand |
