# File Structure

> Applies to: all new files and modules in `src2/`.

## File Naming Pattern

```text
<primary>-<secondary>.<role>.<ext>
```

- `<primary>` — resource/domain (`alert`, `submission`, `user`)
- `<secondary>` — action/sub-feature (`list`, `detail`, `create`)
- `<role>` — technical role (see table below)
- `<ext>` — `.tsx`, `.ts`, `.json`

## Module File Roles

| Role Suffix | Extension | Purpose |
|-------------|-----------|---------|
| `.components` | `.tsx` | UI components (memo, displayName, props) |
| `.models` | `.ts` | Type declarations, `DEFAULT_*` constants, const arrays |
| `.hooks` | `.tsx` | Shared hooks (reused in 3+ components) |
| `.utils` | `.ts` | Pure utility functions |
| `.utils.test` | `.ts` | Unit tests for utils |
| `.store` | `.ts` | Zustand store (`createAppStore`) |
| `.providers` | `.tsx` | Context providers, store providers |
| `.i18n.en` / `.i18n.fr` | `.json` | Translation files |
| `.pom` | `.ts` | Playwright Page Object Model |
| `.spec` | `.ts` | Playwright E2E tests |

## Where to Put Code

| Type | Location |
|------|----------|
| Shared types/logic | `src2/commons/<category>/` |
| Feature module | `src2/components/<module>/` |
| Config/bootstrap | `src2/core/` |
| Public assets | `public/` |

## Naming Conventions

- Folders: `kebab-case`
- Constant exports: `SCREAMING_SNAKE_CASE`
- Type exports: `PascalCase`
- No `index` files as root elements — name files explicitly

## File-Based Module (flat)

```text
<module>/
├── <module>.components.tsx
├── <module>.models.ts
├── <module>.hooks.tsx
├── <module>.utils.ts
├── <module>.utils.test.ts
├── <module>.store.ts
├── <module>.providers.tsx
├── <module>.i18n.en.json
├── <module>.i18n.fr.json
├── <module>.pom.ts
├── <module>.spec.ts
└── index.ts
```

## Folder-Based Module (nested)

Use when > 3 files OR sub-features:

```text
<module>/
├── components/
├── hooks/
├── models/
├── utils/
├── pom/
├── spec/
├── <module>.store.ts
├── <module>.providers.tsx
├── <module>.i18n.en.json
├── <module>.i18n.fr.json
└── index.ts
```

## Decision Table

| Signal | Approach |
|--------|----------|
| < 5 components, simple hooks | File-based |
| 300+ lines per role file | Folder-based |
| Many independently testable components | Folder-based |

## Rules

- `.tsx` for files with JSX, `.ts` for pure logic/types
- Single-component files must be placed in the module's `components/` folder
- Single-component filenames must match the component name (PascalCase), e.g. `AISummarySection.tsx`
- Tests co-located: `*.test.ts` next to source
- One `index.ts` per module — exports public API only
- 1:1 mappings: component → POM, utility → test file
- POMs mirror component filenames: `ComponentA.tsx` → `ComponentA.pom.ts`

## Creating a Module

1. Create `<module>.models.ts` — types + `DEFAULT_<MODEL>`
2. Create `<module>.components.tsx` — component(s)
3. Add `.utils.ts` only if pure functions extracted from components
4. Add `.store.ts` + `.providers.tsx` only if feature-scoped state needed
5. Add `.i18n.*.json` only if module has user-visible strings

