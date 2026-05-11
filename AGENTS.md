# Project Coding Instructions

This project follows strict architecture rules documented in `src/agents/`.

Before generating or modifying code, read and follow the AI rules in `src/agents/`:

## Architecture & File Structure

- `src/agents/architecture.agent.md` — Layer dependencies, forbidden/required patterns
- `src/agents/file-structure.agent.md` — Where to put files, naming conventions

## File Types

- `src/agents/file-structure/components.agent.md` — How to write React components
- `src/agents/file-structure/hooks.agent.md` — Hook ordering, when to extract hooks
- `src/agents/file-structure/models.agent.md` — Type declarations, defaults, enums
- `src/agents/file-structure/i18n.agent.md` — Translation key conventions
- `src/agents/file-structure/utils.agent.md` — Utility function patterns
- `src/agents/file-structure/utils.test.agent.md` — Unit test patterns for utilities
- `src/agents/file-structure/pom.agent.md` — Page Object Model for E2E tests
- `src/agents/file-structure/spec.agent.md` — Playwright E2E spec files

## Conventions

- `src/agents/conventions/imports.agent.md` — Import ordering and syntax
- `src/agents/conventions/styling.agent.md` — Styling approach (styled, raw HTML, theme)
- `src/agents/conventions/performance.agent.md` — Memoization, stable references, selectors
- `src/agents/conventions/accessibility.agent.md` — ARIA, semantic HTML, keyboard, E2E locators
- `src/agents/conventions/react.agent.md` — React hooks and components usage guide

## Git Commit Messages

When asked to write a commit message, run `git diff --cached --stat` and `git diff --cached` to inspect all staged changes. Then produce a message as:

- A single flat bullet-point list (no title line, no paragraphs, no grouping)
- One bullet per logical change
- Each bullet starts with a **bold high-level description**, followed by an em dash (—) and the technical detail
- Use imperative mood (e.g. "Add", "Fix", "Remove", "Replace", "Rename")
- Inline markdown formatting:
  - `backticks` for code symbols, file paths, and anything you'd type in an editor
  - **bold** for modules or areas as a whole (e.g. **core**, **SubmitPage**, **router**)
  - *italic* for specific items within a module (e.g. *Link*, *replace* variant, *MonacoEditor*)

Example:

```
- **Migrate auth context to selector pattern** — replace `useAuthContext` with `useSessionStore` leaf selectors across all **dashboard** components
- **Add loading skeleton to UserCard** — wrap *UserCard* avatar and name fields in `Skeleton` placeholders during fetch
- **Fix stale closure in debounced search** — capture latest `query` ref inside `useCallback` in `SearchInput.tsx`
- **Remove deprecated date formatter** — delete `formatLegacyDate` from `shared/utils/date.utils.ts` and replace all usages with *DateDisplay* component
- **Add keyboard navigation to TagList** — wire `onKeyDown` handler for arrow-key focus movement in **settings** *TagList*
```
