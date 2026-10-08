# Repository Agent Guidance

This file is the repository entry point for coding agents. Detailed project
guidance and reusable workflows live under `.agents/`.

## Before Implementing Features

1. Inspect the target module, neighboring implementations, tests, and package scripts.
2. Read [architecture](.agents/instructions/architecture.instructions.md),
   [file structure](.agents/instructions/file-structure.instructions.md), and
   [import conventions](.agents/instructions/conventions/imports.instructions.md).
3. Read the topic-specific instructions below before editing relevant areas.
4. Make a focused change and run the narrowest relevant validation. Run
   `pnpm typecheck` when a change affects TypeScript.

| Work area | Read these instructions |
| --- | --- |
| React components | [Components](.agents/instructions/file-structure/components.instructions.md), [React](.agents/instructions/conventions/react.instructions.md), [styling](.agents/instructions/conventions/styling.instructions.md), [accessibility](.agents/instructions/conventions/accessibility.instructions.md), [performance](.agents/instructions/conventions/performance.instructions.md) |
| Hooks and state | [Hooks](.agents/instructions/file-structure/hooks.instructions.md), [models](.agents/instructions/file-structure/models.instructions.md), [performance](.agents/instructions/conventions/performance.instructions.md) |
| Utilities | [Utility conventions](.agents/instructions/file-structure/utils.instructions.md), [utility test conventions](.agents/instructions/file-structure/utils.test.instructions.md) |
| Localization | [i18n](.agents/instructions/file-structure/i18n.instructions.md) |
| Documentation | [Module documentation](.agents/instructions/file-structure/docs.instructions.md) |
| Playwright tests | [Specs](.agents/instructions/file-structure/spec.instructions.md), [page objects](.agents/instructions/file-structure/pom.instructions.md) |

## Reusable Workflows

- Use the `react-feature-implementation` skill for React feature work.
- Use `api-reviewer`, `bug-hunter`, `codebase-reviewer`, or
  `performance-reviewer` for focused reviews.
- Use `commit-message` to draft a message from staged changes. Do not commit
  unless explicitly asked.

All reusable skills are under `.agents/skills/`. Keep detailed guidance under
`.agents/instructions/` authoritative; do not maintain duplicate rule copies.
