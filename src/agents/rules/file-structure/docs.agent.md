# Module Documentation

## 1. Purpose

Every `<module>.docs.md` file documents one module for two audiences:

- Humans who need to understand what the module provides and how to use it.
- AI contributors who need enough local context to make changes consistent with the module's design.

The document must describe the current implementation, public API, behavior, boundaries, and important integration points. It is not a changelog, task list, or duplicate of source code.

## 2. File Naming And Location

- Name the file `<module>.docs.md`.
- Place it at the root of the module folder.
- Keep the module name in the title, for example `# Features/Path-Params`.
- Update the document when public APIs, behavior, file responsibilities, or integration boundaries change.
- Use paths and symbols that currently exist in the module. Do not document planned or removed APIs.

## 3. Required Structure

Use the following sections in this order. Sections may be omitted only when they do not apply to the module.

```markdown
# Module Name

## 1. Purpose

## 2. Features

## 3. Concepts

## 4. Configuration

## 5. Usage

## 6. Codebase (Internals)
```

Add `## 7. Related Modules` when the module has meaningful dependencies or integration points outside its own folder.

## 4. Purpose

The Purpose section must answer:

- What problem does the module solve?
- What does it provide?
- Who or what consumes it?
- What is its main boundary or responsibility?

Keep this section short. State the behavior directly. Avoid vague phrases such as "handles various things" and avoid implementation details that belong in later sections.

Example:

```markdown
## 1. Purpose

Type-safe URL path parameter extraction and encoding for route definitions. The module derives parameter keys from path literals and provides codecs for parsing locations and serializing route values.
```

## 5. Features

List the module's important capabilities as concise bullets. Each bullet should describe observable behavior or a meaningful design property.

Prefer this format:

```markdown
## 2. Features

- **Typed extraction** - Derives parameter keys from a route path literal
- **Safe encoding** - Encodes values during serialization and decodes them during parsing
- **Fallback behavior** - Uses configured defaults for missing or invalid values
```

Include only features supported by the current implementation. Do not turn every function into a feature bullet.

## 6. Concepts

Explain the vocabulary needed to understand the module. Use a subsection for each important abstraction, type, state, or data flow.

For each concept, describe:

- What it represents.
- What fields or operations matter.
- How it relates to the other concepts.
- Any constraints or fallback behavior.

Use short lists for object shapes and small examples where types or data flow are important. Do not copy complete type definitions when a summary is sufficient.

Example:

```markdown
## 3. Concepts

### Codec

A compiled parser and serializer for one route pattern. It contains the configured blueprints, a type marker for inference, and `parse` and `stringify` operations.

### Blueprint

A definition for one value. It provides a type marker, a parser for raw input, and a serializer for typed output.
```

## 7. Configuration

Document configuration APIs, factories, options, defaults, and supported variants. Use a table when several options have the same shape.

A configuration table should identify:

- The option or factory name.
- Its default value.
- Its accepted values or types.
- Its behavior.

Include a minimal creation example after the table when configuration is not self-explanatory.

```markdown
## 4. Configuration

| Option | Default | Behavior |
| ------ | ------- | -------- |
| `enabled` | `false` | Disables the feature when false |
| `mode` | `'safe'` | Selects the processing strategy |
```

Do not invent defaults. Verify them in the model, factory, utility, or tests before documenting them.

## 8. Usage

Show the normal consumer workflow from setup to use. Examples must use the public module entry point and current symbol names.

Usage examples should:

- Import from the module alias or public `index.ts`.
- Use realistic values from the module domain.
- Compile against the current public types when practical.
- Show the result or inferred type when that is important.
- Explain whether the consumer calls the module directly or reaches it through another abstraction.

If the module is normally consumed indirectly, say so explicitly and show the integration boundary.

Avoid examples that reference nonexistent hooks, route helpers, files, or APIs.

## 9. Codebase (Internals)

Document the module's file responsibilities without duplicating source code.

### Key Files

Use a table with one row per meaningful file:

| File | Role |
| ---- | ---- |
| `<module>.models.ts` | Shared types and default values |
| `<module>.utils.ts` | Pure module utilities |
| `<module>.utils.test.ts` | Unit tests for the utilities |
| `index.ts` | Explicit public exports |

List only files that exist and have a meaningful role. Include nested component, hook, provider, store, or test files when they are important to understanding the module.

### Type Utilities

If the module contains non-trivial generic or derived types, add a table describing each public type and its purpose. Focus on how consumers use the type, not on reproducing its implementation.

### Data Flow And Boundaries

Add a short subsection when the module has a meaningful flow between input, transformation, state, storage, or output. Identify:

- The input boundary.
- The main transformation or decision point.
- The output or consumer.
- Error, fallback, or invalid-input behavior.

## 10. Related Modules

When applicable, list nearby modules and explain the relationship in one line each.

```markdown
## 7. Related Modules

- `core/routes/` - Consumes the module's codecs when building route definitions
- `features/search-params/` - Uses a parallel parameter parsing model
```

Do not list unrelated modules just to make the section longer.

## 11. Documentation Rules For AI Contributors

When using a `<module>.docs.md` file to change code:

1. Read the documentation and the module's public `index.ts` before editing.
2. Verify documented symbols, files, defaults, and behavior against the current source and tests.
3. Treat the document as module-specific guidance, not as a replacement for architecture rules.
4. Preserve the documented public API unless the task explicitly requires an API change.
5. Update the document when the change alters the module's purpose, public API, behavior, file structure, or integration boundary.
6. Keep examples aligned with the project's import aliases and naming conventions.
7. Prefer a focused test or typecheck to validate examples and behavior.

## 12. Style Rules

- Use Markdown headings and keep the heading order consistent.
- Prefer concise prose and descriptive tables.
- Use backticks for symbols, file names, paths, and code values.
- Use fenced code blocks with a language identifier.
- Use ASCII punctuation in new documentation unless the module already consistently uses other characters.
- Describe behavior directly; avoid unexplained marketing language.
- Avoid references to implementation sources that readers cannot access.
- Do not claim that a feature is supported unless source code or tests demonstrate it.
- Do not document private helpers unless they are important for understanding behavior or maintaining invariants.
- Keep documentation close to the module and avoid duplicating repository-wide conventions.
