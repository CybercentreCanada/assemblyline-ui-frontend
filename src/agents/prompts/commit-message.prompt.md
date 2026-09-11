---
mode: ask
description: >
  Write a git commit message from the currently staged changes. Inspect the
  staged diff, summarize each logical change as a flat bullet list, and return
  the result inside a markdown code block.
---

# Commit Message Writer

Write a git commit message based on the currently staged changes.

## Required Workflow

1. Inspect the staged changes with both:
   - `git diff --cached --stat`
   - `git diff --cached`
2. Infer the logical changes from the staged diff, not from user summaries alone.
3. Return only the commit message content inside a markdown code block.

## Output Format

- Use a single flat bullet-point list.
- Use one bullet per logical change.
- Start each bullet with a **bold high-level summary**.
- After the bold summary, add an em dash followed by the technical description.
- Use imperative mood.
- Use `backticks` for code symbols, file paths, commands, and typed values.

## Rules

- Do not add a title.
- Do not add paragraphs before or after the code block.
- Do not group bullets under subheadings.
- Do not mention unstaged changes.
- Do not invent changes that are not present in the staged diff.
- Prefer 2 to 5 bullets unless the staged diff clearly requires more.

## Example Shape

```markdown
- **Fix router reconciliation** — update `useAppNavigate` to write the active `routeKey` and trim panels with `removePanel(...)`
- **Simplify panel state** — comment out tab-related fields in `router.models.tsx` and stop reconciling pinned or temporary routes
```
