# Repository Agent Guidance

This file is the repository entry point for coding agents. Detailed project
instructions live under `.github/instructions/`; reusable workflows live under
`.agents/skills/`.

## Before Implementing Features

1. Inspect the target module, neighboring implementations, tests, and package scripts.
2. Read [architecture](.github/instructions/architecture.instructions.md),
   [file structure](.github/instructions/file-structure.instructions.md), and
   [import conventions](.github/instructions/conventions/imports.instructions.md).
3. Read the topic-specific instructions below before editing relevant areas.
4. Make a focused change and run the narrowest relevant validation. Run
   `pnpm typecheck` when a change affects TypeScript.

| Work area | Read these instructions |
| --- | --- |
| React components | [Components](.github/instructions/file-structure/components.instructions.md), [React](.github/instructions/conventions/react.instructions.md), [styling](.github/instructions/conventions/styling.instructions.md), [accessibility](.github/instructions/conventions/accessibility.instructions.md), [performance](.github/instructions/conventions/performance.instructions.md) |
| Hooks and state | [Hooks](.github/instructions/file-structure/hooks.instructions.md), [models](.github/instructions/file-structure/models.instructions.md), [performance](.github/instructions/conventions/performance.instructions.md) |
| Utilities | [Utility conventions](.github/instructions/file-structure/utils.instructions.md), [utility test conventions](.github/instructions/file-structure/utils.test.instructions.md) |
| Localization | [i18n](.github/instructions/file-structure/i18n.instructions.md) |
| Documentation | [Module documentation](.github/instructions/file-structure/docs.instructions.md) |
| Playwright tests | [Specs](.github/instructions/file-structure/spec.instructions.md), [page objects](.github/instructions/file-structure/pom.instructions.md) |

## Reusable Workflows

- Use the `react-feature-implementation` skill for React feature work.
- Use `api-reviewer`, `bug-hunter`, `codebase-reviewer`, or
  `performance-reviewer` for focused reviews.
- Use `commit-message` to draft a message from staged changes. Do not commit
  unless explicitly asked.

All reusable skills are under `.agents/skills/`. Keep `.github/instructions/`
authoritative; do not maintain duplicate rule copies.
