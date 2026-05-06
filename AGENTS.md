# Project Coding Instructions

This project follows strict architecture rules documented in `src2/docs/`.

Before generating or modifying code, read and follow the AI rules in `src2/docs/`:

## Architecture & File Structure

- `src2/docs/architecture.ai.md` — Layer dependencies, forbidden/required patterns
- `src2/docs/file-structure.ai.md` — Where to put files, naming conventions

## File Types

- `src2/docs/file-structure/components.ai.md` — How to write React components
- `src2/docs/file-structure/hooks.ai.md` — Hook ordering, when to extract hooks
- `src2/docs/file-structure/models.ai.md` — Type declarations, defaults, enums
- `src2/docs/file-structure/i18n.ai.md` — Translation key conventions
- `src2/docs/file-structure/utils.ai.md` — Utility function patterns
- `src2/docs/file-structure/utils.test.ai.md` — Unit test patterns for utilities
- `src2/docs/file-structure/pom.ai.md` — Page Object Model for E2E tests
- `src2/docs/file-structure/spec.ai.md` — Playwright E2E spec files

## Conventions

- `src2/docs/conventions/imports.ai.md` — Import ordering and syntax
- `src2/docs/conventions/styling.ai.md` — Styling approach (styled, raw HTML, theme)
- `src2/docs/conventions/performance.ai.md` — Memoization, stable references, selectors
- `src2/docs/conventions/accessibility.ai.md` — ARIA, semantic HTML, keyboard, E2E locators
- `src2/docs/conventions/react.ai.md` — React hooks and components usage guide

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
