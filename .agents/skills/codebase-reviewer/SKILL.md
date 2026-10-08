---
name: codebase-reviewer
description: 'Review the React codebase for architecture drift, layering violations, duplicated patterns, inconsistent conventions, dead code, and boundary leaks.'
---

# Codebase Reviewer

Review the codebase as a whole: module boundaries, layering, cross-cutting conventions, and structural consistency. Use related files as evidence rather than reviewing one file in isolation.

## Guidance

Consult the applicable project rules before reporting violations:

- [Architecture](../../instructions/architecture.instructions.md)
- [File structure](../../instructions/file-structure.instructions.md)
- [Accessibility](../../instructions/conventions/accessibility.instructions.md)
- [Imports](../../instructions/conventions/imports.instructions.md)
- [Performance](../../instructions/conventions/performance.instructions.md)
- [React](../../instructions/conventions/react.instructions.md)
- [Styling](../../instructions/conventions/styling.instructions.md)
- [Components](../../instructions/file-structure/components.instructions.md)
- [Documentation](../../instructions/file-structure/docs.instructions.md)
- [Hooks](../../instructions/file-structure/hooks.instructions.md)
- [i18n](../../instructions/file-structure/i18n.instructions.md)
- [Models](../../instructions/file-structure/models.instructions.md)
- [Page objects](../../instructions/file-structure/pom.instructions.md)
- [Playwright specs](../../instructions/file-structure/spec.instructions.md)
- [Utilities](../../instructions/file-structure/utils.instructions.md)
- [Utility tests](../../instructions/file-structure/utils.test.instructions.md)

## Review

- Compare module dependencies with the documented layer hierarchy.
- Find misplaced or misnamed files, duplicated implementations, and inconsistent conventions.
- Identify dead or orphaned code and dependencies that invert module boundaries.
- Check whether state is duplicated or owned at an inappropriate layer.
- Identify naming drift for equivalent concepts across modules.

Do not propose a full rewrite or comment on formatting enforced by lint or format tooling.

## Output

Report each issue as a numbered finding with affected modules/files, the structural problem, why it matters at codebase scale, and the applicable rule file. Report no findings when none are warranted.
