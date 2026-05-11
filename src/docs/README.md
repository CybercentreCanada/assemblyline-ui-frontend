# Frontend Documentation

> Architecture, file-structure rules, and conventions for the frontend application.

## Structure

```
src2/docs/
├── architecture.ai.md / .docs.md     ← Layer rules, project structure
├── file-structure.ai.md / .docs.md   ← File naming, module layout
├── file-structure/                    ← How to write specific file types
│   ├── components.ai.md / .docs.md
│   ├── hooks.ai.md / .docs.md
│   ├── i18n.ai.md / .docs.md
│   ├── models.ai.md / .docs.md
│   ├── utils.ai.md / .docs.md
│   ├── utils.test.ai.md / .docs.md
│   ├── pom.ai.md / .docs.md
│   └── spec.ai.md / .docs.md
└── conventions/                       ← Cross-cutting quality & style
    ├── accessibility.ai.md / .docs.md
    ├── imports.ai.md / .docs.md
    ├── performance.ai.md / .docs.md
    ├── react.ai.md / .docs.md
    └── styling.ai.md / .docs.md
```

## File Suffixes

- **`.ai.md`** — Terse rules for AI coding assistants (50–150 lines)
- **`.docs.md`** — Human-readable explanations with context (150–300 lines)

## Folder Purpose

- **Root level** (`architecture`, `file-structure`): explain the project as a whole
- **`file-structure/`**: how to write code in specific file types (components, hooks, models, etc.)
- **`conventions/`**: cross-cutting concerns that apply broadly (performance, styling, state, accessibility)

## Audience

| Reader | Use |
|--------|-----|
| New developer | `*.docs.md` files — start with architecture, then file-structure |
| Returning developer | Relevant `*.docs.md` for the topic at hand |
| AI coding assistant | `*.ai.md` files (referenced from `.github/copilot-instructions.md`) |

## Parity Rule

Every topic must have both an `.ai.md` and a `.docs.md` file. If one is missing, it's a gap to fill.
