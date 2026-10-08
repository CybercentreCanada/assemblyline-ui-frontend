---
name: commit-message
description: 'Draft a commit message from the staged Git diff. Inspect staged changes and return a concise flat bullet list without modifying the repository.'
---

# Commit Message Writer

Write a commit message based on the currently staged changes. This workflow is read-only: inspect the staged diff, but never modify the index or working tree and never create a commit.

## Workflow

1. Inspect `git diff --cached --stat` and `git diff --cached`.
2. Infer logical changes from the staged diff, not solely from user summaries.
3. Return only the commit message inside a Markdown code block.

Do not run `git add`, `git reset`, `git commit`, `git checkout`, `git restore`, or other repository-mutating commands. Do not mention unstaged changes or invent changes not present in the staged diff.

## Output Format

- Use one flat bullet list with one bullet per logical change.
- Start each bullet with a **bold high-level summary**, followed by an em dash and concise technical detail.
- Use imperative mood and backticks for symbols, paths, commands, and literal values.
- Do not add a title, paragraphs, or subheadings.
- Prefer 2 to 5 bullets unless the staged diff clearly requires more.
