# AI Knowledge Base

Machine-readable architecture rules and coding patterns for AI coding assistants.

## Purpose

These documents define the coding standards, architecture constraints, and patterns that AI assistants should follow when generating or modifying code in this codebase. They are written as **tool-agnostic plain markdown** so they work with any AI coding tool.

## How to Use

### For GitHub Copilot (VS Code)

A `.github/copilot-instructions.md` file at the repo root references these docs. Copilot reads it automatically.

For task-specific workflows, skills are defined in `.github/skills/`.

### For Cursor

A `.cursor/rules/project.mdc` file at the repo root references these docs. Cursor reads it automatically.

### For Other AI Tools

Point your AI assistant to read the files in this folder. The content is self-contained markdown. Most AI tools support a "project rules" or "system prompt" file — create one that references `src2/docs/ai/`.

### Manual

If your tool doesn't auto-discover rules, paste this at the start of a session:

> Before generating code, read the architecture rules in `src2/docs/ai/`. Follow the patterns in `architecture-rules.md`, `component-patterns.md`, `state-patterns.md`, and `file-structure.md`.

## Files

| File | What it Covers |
|------|---------------|
| [architecture-rules.md](./architecture-rules.md) | Layer dependencies, forbidden patterns, required patterns, core principles |
| [component-patterns.md](./component-patterns.md) | How to write React components (structure, hooks, handlers, conditionals) |
| [state-patterns.md](./state-patterns.md) | How to read/write state (Zustand, React Query, custom hooks) |
| [file-structure.md](./file-structure.md) | Where to put files, naming, imports, barrel exports |
| [routing-patterns.md](./routing-patterns.md) | How to add routes, type-safe navigation, panel navigation |
| [i18n-patterns.md](./i18n-patterns.md) | Translation key conventions |

## Detailed Module Documentation

Each module also has a co-located `.docs.md` file with in-depth patterns:

- `core/config/config.docs.md` — State philosophy, store structure, persistence, why single store
- `core/api/api.docs.md` — Query/mutation patterns, cache invalidation, error handling
- `core/router/router.docs.md` — Multi-panel router concepts, type-safe routes, why custom router

## Adding Support for a New AI Tool

1. Check if your tool has a project-level rules file (e.g., `.cursorrules`, `.windsurfrules`, `.aider.conf.yml`)
2. Create that file at the repo root
3. In it, reference or include the content from `src2/docs/ai/`
4. Submit a PR with the adapter file
